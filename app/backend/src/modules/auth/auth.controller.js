const authService = require("./auth.service");

const register = async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result, message: "Registro exitoso" });
};

const login = async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result, message: "Login exitoso" });
};

const googleAuth = async (req, res) => {
  const result = await authService.googleAuth(req.body);
  res.json({ success: true, data: result, message: "Login con Google exitoso" });
};

const getProfile = async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({ success: true, data: user });
};

module.exports = { register, login, googleAuth, getProfile };
