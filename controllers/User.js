import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';
import { getAllFunction, getByIdFunction, addFunction, removeFunction } from './Common.js';
import Target from '../models/User.js';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3 } from '../config/db.js';

const deleteFromWasabi = async (folderName) => {
  if (!folderName) return;

  try {
    const listParams = {
      Bucket: process.env.WASABI_BUCKET_NAME,
      Prefix: folderName,
    };

    const listCommand = new ListObjectsV2Command(listParams);
    const listResponse = await s3.send(listCommand);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      const deleteParams = {
        Bucket: process.env.WASABI_BUCKET_NAME,
        Delete: {
          Objects: listResponse.Contents.map((object) => ({ Key: object.Key })),
        },
      };

      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      await s3.send(deleteCommand);
      console.log(`Deleted ${listResponse.Contents.length} files from ${folderName}`);
    } else {
      console.log(`No files found in folder: ${folderName}`);
    }
  } catch (error) {
    console.error('Error deleting folder from Wasabi:', error);
    throw error;
  }
};

const getAll = asyncHandler(async (req, res) => {
  getAllFunction(req, res, Target)
});

const getById = asyncHandler(async (req, res) => {
  getByIdFunction(req, res, Target)
});

const add = asyncHandler(async (req, res) => {
  addFunction(req, res, Target)
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ...updateData } = req.body;

  const targetCheck = await Target.findById(id);
  if (!targetCheck) {
    return res.status(404).send({ error: 'Cible non trouvée!' });
  }

  const checkEmail = await Target.findOne({ email: updateData.email }).select('-password');
  if (checkEmail && checkEmail.email !== targetCheck.email) {
    return res.status(400).send({ error: 'E-mail déjà utilisé' });
  }

  const checkUsername = await Target.findOne({ username: updateData.username }).select('-password');
  if (checkUsername && checkUsername.username !== targetCheck.username) {
    return res.status(400).send({ error: "Nom d'utilisateur déjà utilisé" });
  }

  if (updateData.currentPassword) {
    const isPasswordValid = await bcrypt.compare(updateData.currentPassword, targetCheck.password);
    if (!isPasswordValid) {
      return res.status(400).send({ error: 'Mot de passe actuel incorrect' });
    }

    if (updateData.password && updateData.password !== targetCheck.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
  }

  const target = await Target.findByIdAndUpdate(id, updateData, { new: true });
  res.status(200).json({ message: "Mise à jour réussie", user: target });
});

const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {password} = req.body;

  const targetCheck = await Target.findById(id);
  if (!targetCheck) {
    return res.status(404).send({ error: 'Target Not Found!' });
  }

  targetCheck.password = await bcrypt.hash(password, 10);

  const target = await Target.findByIdAndUpdate(id, targetCheck, { new: true });
  res.status(200).json({ message: "Updated Successfully", user: target });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const user = await Target.findById(id);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  const correctPassword = await bcrypt.compare(password, user.password);

  if(!correctPassword){
    return res.status(400).send({ message: 'Mot de passe incorrect' });
  }

  await deleteFromWasabi(user.username);

  const target = await Target.findByIdAndDelete(id);

  if (!target) {
    res.status(404).json({ message: "Cible non trouvée !!!" })
  }

  res.status(200).json({ message: "Cible supprimée avec succès" })
});

const checkUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const target = await Target.findOne({ $or: [{ username: username }, { email: username }] }).select('-password');

  if (target) {
    return res.status(404).send({ error: "Nom d'utilisateur/e-mail utilisé" });
  }

  return res.status(200).json({ message: "Nom d'utilisateur/e-mail non trouvé" });
});

const checkUsernameExistsOnce = asyncHandler(async (req, res) => {
  const { username, id } = req.params;
  const target = await Target.findOne({
    $and: [
      { $or: [{ username: username }, { email: username }] },
      { _id: { $ne: id } }
    ] }).select('-password');
    
  if (target) {
    return res.status(404).send({ error: "Nom d'utilisateur/e-mail utilisé" });
  }

  return res.status(200).json({ message: "Nom d'utilisateur/e-mail non trouvé" });
});

export {
  getAll,
  getById,
  add,
  update,
  remove,
  checkUsername,
  updatePassword,
  checkUsernameExistsOnce,
};