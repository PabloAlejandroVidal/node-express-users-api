const express = require('express');
const User = require('../models/User');
const validar = require('../middlewares/validar');
const { check, param, body } = require('express-validator');
const router = express.Router();


// **Obtener todos los usuarios**
router.get("/usuarios", async (req, res) => {
    try {
      const usuarios = await User.find();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener usuarios", error });
    }
});


// **Obtener un usuario por ID con validación**
router.get("/usuarios/:id",[
    param("id").isMongoId().withMessage("ID inválido")],
    validar,
    async (req, res) => {
        try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
        res.status(200).json(usuario);
        } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener usuario", error });
        }
    }
);


// **Crear usuario con validaciones**
router.post("/usuarios",
    [
        body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        body("edad").isInt({ min: 0 }).withMessage("La edad debe ser un número positivo"),
    ],
    validar,
    async (req, res) => {
        try {
        const nuevoUsuario = new User(req.body);
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);
        } catch (error) {
        res.status(500).json({ mensaje: "Error al crear usuario", error });
        }
    }
);

// **Actualizar usuario**
router.put("/usuarios/:id",
    [
        param("id").isMongoId().withMessage("ID inválido"),
        body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacío"),
        body("edad").optional().isInt({ min: 0 }).withMessage("La edad debe ser un número positivo"),
    ],
    validar,
    async (req, res) => {
        try {
        const usuario = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
        res.status(200).json(usuario);
        } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar usuario", error });
        }
    }
);

// **Eliminar usuario**
router.delete("/usuarios/:id",
    param("id").isMongoId().withMessage("ID inválido"),
    validar,
    async (req, res) => {
        try {
        const usuario = await User.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
        res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
        } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar usuario", error });
        }
    }
);
  
module.exports = router;