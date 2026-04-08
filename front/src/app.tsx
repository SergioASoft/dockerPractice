import { useEffect, useState } from "react";
import { Task } from "./types";
import { getTasks, createTask, toggleTask, deleteTask } from "./api";

type Filter = "all" | "pending" | "done";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    try {
      const task = await createTask(title.trim(), description.trim());
      setTasks((prev) => [task, ...prev]);
      setTitle("");
      setDescription("");
    } catch {
      setError("Error al agregar tarea");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(task: Task) {
    try {
      const updated = await toggleTask(task.id, !task.completed);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      setError("Error al actualizar tarea");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Error al eliminar tarea");
    }
  }

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const donePct = tasks.length ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">TaskFlow</span>
        </div>

        <div className="progress-section">
          <p className="progress-label">Progreso global</p>
          <div className="progress-ring-wrap">
            <svg viewBox="0 0 80 80" className="progress-ring">
              <circle cx="40" cy="40" r="32" className="ring-bg" />
              <circle
                cx="40" cy="40" r="32"
                className="ring-fill"
                strokeDasharray={`${donePct * 2.01} 201`}
              />
            </svg>
            <span className="progress-pct">{donePct}%</span>
          </div>
          <p className="progress-sub">{tasks.filter((t) => t.completed).length} de {tasks.length} completadas</p>
        </div>

        <nav className="filters">
          {(["all", "pending", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              <span className="filter-dot" />
              {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : "Completadas"}
              <span className="filter-count">
                {f === "all" ? tasks.length : f === "pending" ? tasks.filter((t) => !t.completed).length : tasks.filter((t) => t.completed).length}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="main-header">
          <h1>
            {filter === "all" ? "Todas las tareas" : filter === "pending" ? "Pendientes" : "Completadas"}
          </h1>
          <span className="task-count-badge">{filtered.length}</span>
        </header>

        <form onSubmit={handleAdd} className="add-form">
          <div className="form-fields">
            <input
              className="input-title"
              type="text"
              placeholder="Título de la tarea..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              className="input-desc"
              type="text"
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-add" disabled={adding}>
            {adding ? "…" : "+ Agregar"}
          </button>
        </form>

        {error && (
          <div className="error-banner">
            ⚠ {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p>Cargando tareas…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">◎</span>
            <p>No hay tareas aquí</p>
          </div>
        ) : (
          <ul className="task-list">
            {filtered.map((task) => (
              <li key={task.id} className={`task-item ${task.completed ? "done" : ""}`}>
                <button
                  className="checkbox"
                  onClick={() => handleToggle(task)}
                  aria-label="Toggle tarea"
                >
                  {task.completed && <span className="check-icon">✓</span>}
                </button>
                <div className="task-body">
                  <p className="task-title">{task.title}</p>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  <p className="task-date">
                    {new Date(task.created_at).toLocaleDateString("es-CO", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(task.id)}
                  aria-label="Eliminar"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}