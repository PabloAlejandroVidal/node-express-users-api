const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Conectar a MongoDB (asegúrate de que MongoDB esté corriendo)
mongoose
  .connect("mongodb://127.0.0.1:27017/miBaseDeDatos")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB", err));

  // Definir un esquema y modelo de ejemplo
const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    edad: Number,
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);

app.get("/usuarios", async (req, res) => {
    try {
      const usuarios = await Usuario.find();
      res.status(200).json(usuarios); // 200 OK
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener usuarios", error });
    }
});

app.post("/usuarios", async (req, res) => {
    try {
        if (!req.body.nombre || !req.body.edad) {
        return res.status(400).json({ mensaje: "Nombre y edad son requeridos" }); // 400 Bad Request
        }

        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario); // 201 Created
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear usuario", error });
    }
});
  

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
console.log(`Servidor corriendo en http://localhost:${PORT}`);
});