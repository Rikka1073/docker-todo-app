import { serve } from "@hono/node-server";
import { PrismaPg } from "@prisma/adapter-pg";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "./generated/prisma/client.js";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];

const app = new Hono();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/todos", (c) => {
  const todos = prisma.post.findMany();
  return c.json(todos);
});

app.post("/todos", async (c) => {
  const { title } = await c.req.json();
  const todo: Todo = {
    id: todos.length + 1,
    title,
    completed: false,
  };
  todos.push(todo);
  return c.json({ todo });
});

app.put("/todos/:id", async (c) => {
  const { id } = c.req.param();
  const { completed } = await c.req.json();
  const todo = todos.find((todo) => todo.id === Number(id));
  if (!todo) {
    return c.notFound();
  }
  todo.completed = completed;
  return c.json({ todo });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
    hostname: "0.0.0.0",
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
