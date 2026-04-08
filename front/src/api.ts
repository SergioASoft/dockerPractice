import { Task } from "./types";

// En producción Nginx redirige /api → backend.
// En desarrollo apunta directo al backend local si lo corres con npm run dev.
const BASE = "/api";

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE}/tasks`);
  if (!res.ok) throw new Error("Error al cargar tareas");
  return res.json();
}

export async function createTask(title: string, description: string): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error("Error al crear tarea");
  return res.json();
}

export async function toggleTask(id: number, completed: boolean): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Error al actualizar tarea");
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar tarea");
}