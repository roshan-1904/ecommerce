import jwt from 'jsonwebtoken';

export const generateToken = (res, id, role) => {
  const token = jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'jwt_secret_fallback_key_123',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', token, options);

  return token;
};
