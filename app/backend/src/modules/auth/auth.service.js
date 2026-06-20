const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../../config/env");
const AppError = require("../../shared/utils/app-error");
const authRepository = require("./auth.repository");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const register = async ({ email, name, password }) => {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError(409, "CONFLICT", "El email ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await authRepository.create({
    email,
    name,
    password: hashedPassword,
  });

  const token = generateToken(user);
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user || !user.password) {
    throw new AppError(401, "UNAUTHORIZED", "Credenciales inválidas");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError(401, "UNAUTHORIZED", "Credenciales inválidas");
  }

  const token = generateToken(user);
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

const googleAuth = async ({ email, name, googleId }) => {
  let user = await authRepository.findByGoogleId(googleId);

  if (!user) {
    user = await authRepository.findByEmail(email);

    if (user) {
      user = await authRepository.update(user.id, { googleId });
    } else {
      user = await authRepository.create({ email, name, googleId });
    }
  }

  const token = generateToken(user);
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

const getProfile = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new AppError(404, "NOT_FOUND", "Usuario no encontrado");
  }
  return user;
};

module.exports = { register, login, googleAuth, getProfile };
