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

      const payload = { usuario: { id: usuario.id } };

      // Generar Access Token
      const accessToken = jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
      );

      // Generar Refresh Token
      const refreshToken = jwt.sign(
          payload,
          process.env.REFRESH_SECRET,
          { expiresIn: '7d' }
      );

      // Guardar Refresh Token en cookie segura
      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'Strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      res.json({ accessToken });
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
      check('password', 'La contraseña es obligatoria').notEmpty(),
    ],
    validar,
    async (req, res) => {
  
      const { email, password } = req.body;
  
      try {
        let usuario = await User.findOne({ email });
        if (!usuario) {
          return res.status(401).json({ msg: 'Usuario no encontrado' });
        }
  
        // Comparamos contraseñas
        const esCorrecto = await bcrypt.compare(password, usuario.password);
        if (!esCorrecto) {
          return res.status(401).json({ msg: 'Contraseña incorrecta' });
        }
  
        const payload = { usuario: { id: usuario.id } };

        // Generar Access Token
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Generar Refresh Token
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Guardar Refresh Token en cookie segura
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });
  
        res.json({ accessToken });
      } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
      }
    }
);
  

// ** Refresh Token - Genera un nuevo Access Token**
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ msg: 'No autorizado' });
        }

        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ msg: 'Token inválido' });

            // Generar un nuevo Access Token
            const accessToken = jwt.sign(
                { usuario: { id: decoded.usuario.id } },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            res.json({ accessToken });
        });
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor' });
    }
});

// ** Logout - Elimina el Refresh Token**
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ msg: 'Logout exitoso' });
});


module.exports = router;
