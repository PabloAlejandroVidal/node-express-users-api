const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Conectar a MongoDB (asegúrate de que MongoDB esté corriendo)
mongoose.connect("mongodb://127.0.0.1:27017/miBaseDeDatos")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB", err));


// Importamos las rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/usuarios', require('./routes/usuarios'));


// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
console.log(`Servidor corriendo en http://localhost:${PORT}`);
});