const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Bienvenido a la API de usuarios!");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



const users = []; // Array que almacena los usuarios

// Crear un usuario
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  const id = users.length + 1;
  const newUser = { id, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Obtener todos los usuarios
app.get("/users", (req, res) => {
  res.json(users);
});

// Obtener un usuario por ID
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  user ? res.json(user) : res.status(404).json({ message: "Usuario no encontrado" });
});

// Actualizar un usuario
app.put("/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  res.json(user);
});

// Eliminar un usuario
app.delete("/users/:id", (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Usuario no encontrado" });

  users.splice(index, 1);
  res.status(204).send(); // Respuesta sin contenido
});
