import asyncHandler from 'express-async-handler';
import { getAllFunction, getByIdFunction, addFunction, updateFunction, removeFunction } from './Common.js';
import Target from '../models/Join.js';

const getAll = asyncHandler(async (req, res) => {
  const target = await Target.find().select('-password').populate('office').populate('user_id');
  res.status(200).json(target);
});

const getById = asyncHandler(async (req, res) => {
  getByIdFunction(req, res, Target)
});

const getAllByOffice = asyncHandler(async (req, res) => {
  const { id } = req.params
  
  const target = await Target.find({ office: id }).select('-password');
  if (!target) {
    return res.status(404).send({ error: 'Pas encore de contact' });
  }
  res.status(200).json(target);
});

const add = asyncHandler(async (req, res) => {
  const body = req.body
  const existingUser = await Target.findOne({user_id: body.user_id, office: body.office});
  if (existingUser) {
    return res.status(400).json({ message: "Vous avez déjà envoyé une demande !" });
  }
  const target = new Target(body)
  await target.save()
  res.status(200).json({ message: "Demande envoyée!" })
});

const update = asyncHandler(async (req, res) => {
  updateFunction(req, res, Target)
});

const remove = asyncHandler(async (req, res) => {
  removeFunction(req, res, Target)
});

export {
  getAll,
  getById,
  add,
  update,
  remove,
  getAllByOffice,
};