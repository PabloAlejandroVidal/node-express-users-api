const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validar = require('../middlewares/validar')

const router = express.Router();

// Registro de usuario
router.post(
  '/register',
  [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'Debe ser un email válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  ],
  validar,
  async (req, res) => {

    const { nombre, email, password } = req.body;

    try {
      let usuario = await User.findOne({ email });
      if (usuario) {
        return res.status(400).json({ msg: 'El usuario ya está en uso' });
      }

      usuario = new User({ nombre, email, password });

      // Encriptamos la contraseña
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);

      await usuario.save();

      // Generamos el JWT
      const payload = { usuario: { id: usuario.id } };
      const token = jwt.sign(payload, 'secreto', { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error en el servidor');
    }
  }
);

router.post(
    '/login',
    [
      check('email', 'Debe ser un email válido').isEmail(),
      check('password', 'La contraseña es obligatoria').exists(),
    ],
    validar,
    async (req, res) => {
  
      const { email, password } = req.body;
  
      try {
        let usuario = await User.findOne({ email });
        if (!usuario) {
          return res.status(400).json({ msg: 'Usuario no encontrado' });
        }
  
        // Comparamos contraseñas
        const esCorrecto = await bcrypt.compare(password, usuario.password);
        if (!esCorrecto) {
          return res.status(400).json({ msg: 'Contraseña incorrecta' });
        }
  
        // Generamos el JWT
        const payload = { usuario: { id: usuario.id } };
        const token = jwt.sign(payload, 'secreto', { expiresIn: '1h' });
  
        res.json({ token });
      } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
      }
    }
  );
  

module.exports = router;
