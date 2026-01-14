import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { getAllFunction, getByIdFunction, addFunction, updateFunction, removeFunction } from './Common.js';
import Target from '../models/Office.js';
import Post from '../models/Post.js';
import Event from '../models/Event.js';
import Join from '../models/Join.js';

const getAll = asyncHandler(async (req, res) => {    
  const target = await Target.find().select('-password').populate('president').populate('vice').populate('secretary');
  res.status(200).json(target);
});

const getById = asyncHandler(async (req, res) => {
  getByIdFunction(req, res, Target)
});

const add = asyncHandler(async (req, res) => {
  addFunction(req, res, Target)
});

const update = asyncHandler(async (req, res) => {
  updateFunction(req, res, Target)
});

const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {password} = req.body;

  const targetCheck = await Target.findById(id);
  if (!targetCheck) {
    return res.status(404).send({ error: 'Cible non trouvée!' });
  }

  targetCheck.password = await bcrypt.hash(password, 10);

  const target = await Target.findByIdAndUpdate(id, targetCheck, { new: true });
  res.status(200).json({ message: "Mise à jour réussie", user: target });
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const target = await Target.findByIdAndDelete(id);

  if (!target) {
    return res.status(404).json({ message: "La cible n'existe pas !!!" });
  }

  await Post.deleteMany({ office: id });

  await Event.deleteMany({ office: id });

  await Join.deleteMany({ office: id });

  res.status(200).json({ message: "La cible et les données associées ont été supprimées avec succès" });
});

const checkName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const target = await Target.findOne({ name: name }).select('-password');

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
  checkName,
  updatePassword,
};