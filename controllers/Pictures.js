import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import {s3} from '../config/db.js';
import User from '../models/User.js';
import Office from '../models/Office.js';

dotenv.config({ path: './.env' });

const deleteFromWasabi = async (fileKey) => {
  if (fileKey) {
    const params = {
      Bucket: process.env.WASABI_BUCKET_NAME,
      Key: fileKey,
    };
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  }
};

const addAvatar = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  let user = await User.findById(userId).select('-password');
  if (!user) {
    user = await Office.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Target not found!' });
    }
  }

  if (user.picture) await deleteFromWasabi(user.picture);

  if (req.file) {
    user.picture = req.file.key;
    await user.save();
    res.status(200).json({ imageUrl: req.file.key });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

const addPv = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  let user = await User.findById(userId).select('-password');
  if (!user) {
    user = await Office.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Target not found!' });
    }
  }

  if (req.file) {
    const url = req.file.key;
    res.status(200).json({ url });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

const addOfficeBackground = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  let user = await Office.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'Target not found!' });
  }

  if (user.backgroundPicture) await deleteFromWasabi(user.backgroundPicture);

  if (req.file) {
    user.backgroundPicture = req.file.key;
    await user.save();
    res.status(200).json({ imageUrl: req.file.key });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

const addEventPostImage = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const user = await Office.findById(userId).select('-password');

  if (!user) return res.status(404).json({ message: 'Office not found!' });

  if (req.files) {
    const urls = req.files.map((file) => file.key);
    res.status(200).json({ urls });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

const addEventPostVideo = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const user = await Office.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'Office not found!' });

  if (req.files) {
    const urls = req.files.map((file) => file.key);
    res.status(200).json({ urls });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

const addEventPostAudio = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const user = await Office.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'Office not found!' });

  if (req.file) {
    const audioUrl = req.file.key;
    res.status(200).json({ audioUrl });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

const getAvatar = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const pictureUrl = req.params.url;

  let user = await User.findById(userId).select('-password');
  let username;
  if (!user) {
    user = await Office.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Target not found!' });
    } else {
      username = user.name;
    }
  } else {
    username = user.username;
  }

  const fileKey = `Users/${username}/${pictureUrl}`;

  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: fileKey,
  };

  const command = new GetObjectCommand(params);

  try {
    const { Body } = await s3.send(command);
    res.attachment(pictureUrl);
    Body.pipe(res);

  } catch (err) {
    console.error('Error retrieving image from Wasabi:', err);
    return res.status(500).json({ message: 'Error retrieving image', error: err.message });
  }
});

const getPv = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const pvUrl = req.params.url;

  const user = await Office.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'Office not found' });

  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: `Offices/Pvs/${user.name}/${pvUrl}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const { Body } = await s3.send(command);
    res.attachment(pvUrl);
    Body.pipe(res);
  } catch (err) {
    console.error('Error retrieving file from Wasabi:', err);
    return res.status(404).json({ message: 'File not found' });
  }
});

const getPvAdmin = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const pvUrl = req.params.url;

  const user = await User.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'Office not found' });

  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: `Users/Pvs/${user.username}/${pvUrl}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const { Body } = await s3.send(command);
    res.attachment(pvUrl);
    Body.pipe(res);
  } catch (err) {
    console.error('Error retrieving file from Wasabi:', err);
    return res.status(404).json({ message: 'File not found' });
  }
});

const getEventPostImage = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const pictureUrl = req.params.url;

  const user = await Office.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'Office not found' });

  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: `Offices/Images/${user.name}/${pictureUrl}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const { Body } = await s3.send(command);
    res.attachment(pictureUrl);
    Body.pipe(res);
  } catch (err) {
    console.error('Error retrieving file from Wasabi:', err);
    return res.status(404).json({ message: 'File not found' });
  }
});

const getEventPostVideo = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const pictureUrl = req.params.url;

  const user = await Office.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'Office not found' });

  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: `Offices/Videos/${user.name}/${pictureUrl}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const { Body } = await s3.send(command);
    res.attachment(pictureUrl);
    Body.pipe(res);
  } catch (err) {
    console.error('Error retrieving file from Wasabi:', err);
    return res.status(404).json({ message: 'File not found' });
  }
});

const getEventPostAudio = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const pictureUrl = req.params.url;

  const user = await Office.findById(userId).select('-password');
  if (!user) return res.status(404).json({ message: 'Office not found' });

  const params = {
    Bucket: process.env.WASABI_BUCKET_NAME,
    Key: `Offices/Audios/${user.name}/${pictureUrl}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const { Body } = await s3.send(command);
    res.attachment(pictureUrl);
    Body.pipe(res);
  } catch (err) {
    console.error('Error retrieving file from Wasabi:', err);
    return res.status(404).json({ message: 'File not found' });
  }
});

export {
  addAvatar,
  addOfficeBackground,
  addEventPostImage,
  addEventPostVideo,
  addEventPostAudio,
  getAvatar,
  getPv,
  getEventPostImage,
  getEventPostVideo,
  getEventPostAudio,
  addPv,
  getPvAdmin,
};
