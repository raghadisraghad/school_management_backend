import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../middleware/Email.js';
import User from '../models/User.js';
import Office from '../models/Office.js';
import { generateToken, generateVerificationToken } from '../utils/jwt.js';

dotenv.config({ path: '../.env' });

const register = asyncHandler(async (req, res) => {
  const {
    role, firstName, lastName, username, email,
    password, tel, birthDate, level, sector, status
  } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    return res.status(400).json({ message: "L'utilisateur existe déjà !" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    role,
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    tel,
    birthDate,
    level,
    sector,
    status
  });

  await newUser.save();

  res.status(201).json({ message: "Utilisateur créé avec succès" });
});

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  let type = "user";
  let user = await User.findOne({ $or: [{ username: username }, { email: username }] });

  if (!user) {
    user = await Office.findOne({ $or: [{ name: username }, { abb: username }, { email: username }] });
    type = "office";
    if (!user)
      return res.status(400).json({ message: "Nom d'utilisateur/e-mail incorrect" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!user.status && type==="user") {
    const verificationToken = generateVerificationToken(user._id);

    const verificationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    
    const body = `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #ffffff;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px;
      border-radius: 15px;
      background: linear-gradient(135deg, #0072ff, #00c6ff);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      animation: fadeIn 1s ease-in-out;
    ">
      <h2 style="
        color: #ffffff;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 20px;
        text-align: center;
        animation: slideIn 0.8s ease-in-out;
      ">Salut ${user.firstName},</h2>
      <p style="
        font-size: 16px;
        margin: 15px 0;
        text-align: center;
        animation: fadeIn 1.2s ease-in-out;
      ">Merci de vous être inscrit chez nous ! Pour finaliser votre inscription, veuillez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous:</p>
      <div style="
        text-align: center;
        margin: 20px 0;
      ">
        <a href="${verificationLink}" style="
          display: inline-block;
          padding: 12px 30px;
          background: #ffffff;
          color: #0072ff;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 50px;
          transition: all 0.3s ease;
        ">Vérifier l'e-mail</a>
      </div>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
        margin: 20px 0;
        animation: fadeIn 1.4s ease-in-out;
      ">⚠️ <strong>Note:</strong> Ce lien expirera dans <strong>15 minutes</strong>.</p>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
        margin: 20px 0;
        animation: fadeIn 1.6s ease-in-out;
      ">Si vous n'avez pas créé de compte, veuillez ignorer cet e-mail.</p>
      <hr style="
        border: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        margin: 20px 0;
      " />
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">Cordialement,</p>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">The Team</p>
      <p style="
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">© 2025 ENSI Vie Estudiantine. Tous droits réservés.</p>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        a:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
      </style>
    </div>
    `;
  
    await sendEmail(user.email, "Vérification du compte", body);

    return res.status(400).json({
      message: "Compte pas encore activé ! E-mail de vérification envoyé.",
    });
  }else if (!user.status && type==="office"){
    return res.status(400).json({
      message: "L'administrateur n'a pas encore approuvé la création de votre bureau!.",
    });
  }

  if (isPasswordValid) {
    const token = generateToken(res, user._id);
    res.status(200).json({ message: 'Logged In successfully', token, type });
  } else {
    return res.status(400).json({ message: "Incorrect Password!" });
  }

});

const verifyOffice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await Office.findById(id);

  if (!user) {
      return res.status(400).json({ message: "Nom d'utilisateur/e-mail incorrect" });
  }

  const verificationToken = generateVerificationToken(user._id);

  const resetPasswordLink = `${process.env.FRONTEND_URL}/resetPassword/${verificationToken}/office`;
  const loginPage = `${process.env.FRONTEND_URL}/login`;

  const body = `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #ffffff;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px;
      border-radius: 15px;
      background: linear-gradient(135deg, #6a11cb, #2575fc);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      animation: fadeIn 1s ease-in-out;
    ">
      <h2 style="
        color: #ffffff;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 20px;
        text-align: center;
        animation: slideIn 0.8s ease-in-out;
      ">Salut ${user.name},</h2>
      <p style="
        font-size: 16px;
        margin: 15px 0;
        text-align: center;
        animation: fadeIn 1.2s ease-in-out;
      ">🎉 Bonne nouvelle ! Votre demande de création de bureau a été <strong>approuvée</strong>!</p>
      <div style="
        background: rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        animation: fadeIn 1.4s ease-in-out;
      ">
        <p style="
          font-size: 16px;
          margin: 10px 0;
          text-align: center;
        ">Si vous vous souvenez de votre mot de passe, cliquez ci-dessous pour vous connecter:</p>
        <div style="
          text-align: center;
          margin: 20px 0;
        ">
          <a href="${loginPage}" style="
            display: inline-block;
            padding: 12px 30px;
            background: #ffffff;
            color: #2575fc;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 50px;
            transition: all 0.3s ease;
          ">Connectez-vous maintenant</a>
        </div>
        <p style="
          font-size: 16px;
          margin: 10px 0;
          text-align: center;
        ">Mot de passe oublié ? Pas de soucis ! Réinitialisez-le ici:</p>
        <div style="
          text-align: center;
          margin: 20px 0;
        ">
          <a href="${resetPasswordLink}" style="
            display: inline-block;
            padding: 12px 30px;
            background: transparent;
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border: 2px solid #ffffff;
            border-radius: 50px;
            transition: all 0.3s ease;
          ">Réinitialiser le mot de passe</a>
        </div>
      </div>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin: 20px 0;
        animation: fadeIn 1.6s ease-in-out;
      ">⚠️ <strong>Note:</strong> Le lien de réinitialisation expire dans <strong>15 minutes</strong>.</p>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin: 20px 0;
        animation: fadeIn 1.6s ease-in-out;
      ">Si vous n'avez pas demandé cela, veuillez ignorer cet e-mail.</p>
      <hr style="
        border: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        margin: 20px 0;
      " />
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">Cordialement,</p>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">The Team</p>
      <p style="
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">© 2025 ENSI Vie Estudiantine. Tous droits réservés.</p>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        a:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
      </style>
    </div>
  `;

  await sendEmail(user.email, "Vérification du compte de bureau", body);

  res.status(200).json({ message: 'E-mail envoyé avec succès'});

});

const verifyUser = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  const user = await User.findByIdAndUpdate(userId, { status: true }, { new: true }).select('-password');

  if (user) {
    res.status(200).json({ message: "Compte vérifié avec succès!" });
  } else {
    user = await Office.findByIdAndUpdate(userId, { status: true }, { new: true }).select('-password');
    if (user) {
      res.status(200).json({ message: "Compte vérifié avec succès!" });
    } else {
      res.status(400).json({ message: "Lien de vérification non valide!" });
    }
  }
});

const logoutUser = asyncHandler((req, res) => {
  res.clearCookie('jwt');
  res.clearCookie('session_id');
  res.status(200).json({ message: 'Déconnexion réussie' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  let user = await User.findOne({ email: email }).select('-password');
  let username;
  let userType;

  if (!user) {
    user = await Office.findOne({ email: email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Email non valide !!!" });
    }
    userType = "office";
    username = user.name;
  } else {
    userType = "user";
    username = user.username;
  }

  const verificationToken = generateVerificationToken(user._id);
  const resetLink = `${process.env.FRONTEND_URL}/resetPassword/${verificationToken}/${userType}`;

  const body = `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #ffffff;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px;
      border-radius: 15px;
      background: linear-gradient(135deg, #ff6f61, #ffcc00);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      animation: fadeIn 1s ease-in-out;
    ">
      <h2 style="
        color: #ffffff;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 20px;
        text-align: center;
        animation: slideIn 0.8s ease-in-out;
      ">Salut ${username},</h2>
      <p style="
        font-size: 16px;
        margin: 15px 0;
        text-align: center;
        animation: fadeIn 1.2s ease-in-out;
      ">Nous avons reçu une demande de réinitialisation de votre mot de passe. Pour terminer le processus, cliquez sur le bouton ci-dessous:</p>
      <div style="
        text-align: center;
        margin: 20px 0;
      ">
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 12px 30px;
          background: #ffffff;
          color: #ff6f61;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 50px;
          transition: all 0.3s ease;
        ">Réinitialiser le mot de passe</a>
      </div>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
        margin: 20px 0;
        animation: fadeIn 1.4s ease-in-out;
      ">⚠️ <strong>Note:</strong> Ce lien expirera dans <strong>15 minutes</strong>.</p>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
        margin: 20px 0;
        animation: fadeIn 1.6s ease-in-out;
      ">Si vous n'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet e-mail.</p>
      <hr style="
        border: 0;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        margin: 20px 0;
      " />
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">Cordialement,</p>
      <p style="
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">The Team</p>
      <p style="
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        text-align: center;
        margin: 10px 0;
        animation: fadeIn 1.8s ease-in-out;
      ">© 2025 ENSI Vie Estudiantine. Tous droits réservés.</p>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        a:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
      </style>
    </div>
  `;

  await sendEmail(user.email, "Réinitialiser le mot de passe", body);

  res.status(200).json({ message: 'Lien de réinitialisation du mot de passe envoyé à votre adresse e-mail!' });
});

export {
  register,
  login,
  verifyUser,
  logoutUser,
  resetPassword,
  verifyOffice,
};