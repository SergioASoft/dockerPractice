const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── GET todas las tareas ──────────────────────────────────
app.get("/api/tasks", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

// ── POST crear tarea ──────────────────────────────────────
app.post("/api/tasks", async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "El título es obligatorio" });
  try {
    const [result] = await db.query(
      "INSERT INTO tasks (title, description) VALUES (?, ?)",
      [title, description || ""]
    );
    const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear tarea" });
  }
});

// ── PUT actualizar estado ─────────────────────────────────
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    await db.query(
      "UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), completed = COALESCE(?, completed) WHERE id = ?",
      [title, description, completed !== undefined ? completed : null, id]
    );
    const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar tarea" });
  }
});

// ── DELETE eliminar tarea ─────────────────────────────────
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({ message: "Tarea eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar tarea" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en puerto ${PORT}`);
});