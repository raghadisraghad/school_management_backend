import asyncHandler from 'express-async-handler';
import { getAllFunction, getByIdFunction, addFunction, updateFunction, removeFunction } from './Common.js';
import Target from '../models/Contact.js';

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
  remove
};