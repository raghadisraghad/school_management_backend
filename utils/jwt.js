import jwt from 'jsonwebtoken';

export const generateToken = (res, userId) => {
  const lastActivity = Math.floor(Date.now() / 1000);
  const token = jwt.sign({ userId: userId, lastActivity }, process.env.SECRET_KEY, { expiresIn: '30d' });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export const generateVerificationToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15min' });
}