import asyncHandler from 'express-async-handler';
import { getAllFunction, getByIdFunction, addFunction, updateFunction, removeFunction } from './Common.js';
import Target from '../models/Event.js';
import Post from '../models/Post.js';

const getAll = asyncHandler(async (req, res) => {
  const target = await Target.find().select('-password').populate('office');
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
  addFunction(req, res, Target)
});

const update = asyncHandler(async (req, res) => {
  updateFunction(req, res, Target)
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const target = await Target.findByIdAndDelete(id).select('-password');

  if (!target) {
    res.status(404).json({ message: "La cible n'existe pas !!!" })
  }
  
  await Post.deleteMany({ event: id });

  res.status(200).json({ message: "Cible supprimée avec succès" })
});

export {
  getAll,
  getById,
  add,
  update,
  remove,
  getAllByOffice,
};