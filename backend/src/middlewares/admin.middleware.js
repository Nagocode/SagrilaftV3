exports.isAdmin = (req, res, next) => {
  if (req.userRole !== 'Admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
  }
  next();
};
