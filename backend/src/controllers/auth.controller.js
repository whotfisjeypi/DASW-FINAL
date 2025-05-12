const User = require('../models/User');
const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const tokens = generateTokens(user);
    res.status(201).json({ ok: true, user, tokens });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, 'Invalid credentials');
    }
    const tokens = generateTokens(user);
    res.json({ ok: true, user, tokens });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError(400, 'Refresh token missing');
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ ok: true, accessToken });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  // A nivel de stateless, se puede implementar blacklist aquí
  res.json({ ok: true, message: 'Logged out' });
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
};
