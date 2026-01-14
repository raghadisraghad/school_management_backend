import bcrypt from 'bcryptjs';
import asyncHandler from 'express-async-handler';

const getAllFunction = asyncHandler(async (req, res, Target) => {
  let target;
  if (Target === "User") {
    target = await Target.find({ role: '1' }).select('-password');
  } else {
    target = await Target.find().select('-password');
  }
  res.status(200).json(target);
});

const getByIdFunction = asyncHandler(async (req, res, Target) => {
  const { id } = req.params
  const target = await Target.findById(id).select('-password');
  if (!target) {
    return res.status(404).send({ error: 'Cible non trouvée!' });
  }
  res.status(200).json(target);
});

const addFunction = asyncHandler(async (req, res, Target) => {
  const body = req.body
  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
  }
  const target = new Target(body)
  await target.save()
  res.status(200).json({ message: "Opération Succès" })
});

const updateFunction = asyncHandler(async (req, res, Target) => {
  const { id } = req.params;
  const { ...updateData } = req.body;
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const targetCheck = await Target.findById(id).select('-password');

  if (!targetCheck) {
    return res.status(404).send({ error: 'Cible non trouvée!' });
  }

  const target = await Target.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  res.status(200).json({ message: "Mise à jour réussie", user: target });
});

const removeFunction = asyncHandler(async (req, res, Target) => {
  const { id } = req.params;
  const target = await Target.findByIdAndDelete(id).select('-password');

  if (!target) {
    res.status(404).json({ message: "La cible n'existe pas !!!" })
  }

  res.status(200).json({ message: "Cible supprimée avec succès" })
});

export {
  getAllFunction,
  getByIdFunction,
  addFunction,
  updateFunction,
  removeFunction
};