import dotenv from 'dotenv';
import Target from '../models/User.js';
import Office from '../models/Office.js';
import multer from 'multer';
import multerS3 from 'multer-s3'
import {s3} from '../config/db.js'

dotenv.config({ path: './.env' });

const fileFilter = (req, file, cb) => {
  if (![
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/mpeg',
    'video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/ogg', 'video/wmv',
    'application/pdf'
  ].includes(file.mimetype)) {
    return cb(new Error('Only image, audio, and video files are allowed'), false);
  }
  cb(null, true);
};

const uploadToWasabi = (subDirectory) => multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.WASABI_BUCKET_NAME,
    acl: 'public-read',
    key: async (req, file, cb) => {
      try {
        const userId = req.params.userId;

        if (!userId) {
          return cb(new Error("userId is missing"), false);
        }

        let target = await Target.findById(userId);
        let username;
        if (!target) {
          target = await Office.findById(userId);
          if (!target) {
            return cb(new Error("Target not found"), false);
          } else {
            username = target.name;
          }
        } else {
          username = target.username;
        }

        const fileName = `${subDirectory}/${username}/${Date.now()}-${file.originalname}`;
        cb(null, fileName);
      } catch (error) {
        cb(new Error("Error creating file path for Wasabi: " + error.message), false);
      }
    },
  }),
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
  fileFilter,
});

const officeImageUpload = uploadToWasabi('Offices/Images');
const officeAudioUpload = uploadToWasabi('Offices/Audios');
const officeVideoUpload = uploadToWasabi('Offices/Videos');
const officePvUpload = uploadToWasabi('Offices/Pvs');
const adminPvUpload = uploadToWasabi('Users/Pvs');
const avatarUpload = uploadToWasabi('Users');

export {
  officeImageUpload,
  officeAudioUpload,
  officeVideoUpload,
  avatarUpload,
  officePvUpload,
  adminPvUpload,
};
