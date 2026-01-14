import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { getAllFunction, getByIdFunction, addFunction, updateFunction, removeFunction } from './Common.js';
import Target from '../models/Pv.js';
import Post from '../models/Post.js';
import Event from '../models/Event.js';
import Join from '../models/Join.js';

const getAll = asyncHandler(async (req, res) => {
  const target = await Target.find().select('-password').populate('user');
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

const remove = asyncHandler(async (req, res) => {
  removeFunction(req, res, Target)
});

export {
  getAll,
  getById,
  add,
  update,
  remove,
};