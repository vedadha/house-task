import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-4588b52f/health", (c) => {
  return c.json({ status: "ok" });
});

// Register new user
app.post("/make-server-4588b52f/register", async (c) => {
  try {
    const { email, password, name, avatar, color } = await c.req.json();

    // Create user in Supabase Auth
    // Automatically confirm the user's email since an email server hasn't been configured.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, avatar, color },
      email_confirm: true,
    });

    if (authError) {
      console.log(`Registration error: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    // Store user profile in KV
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      name,
      avatar,
      color,
    });

    return c.json({
      user: {
        id: authData.user.id,
        email,
        name,
        avatar,
        color,
      },
    });
  } catch (error) {
    console.log(`Registration error: ${error}`);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Get user profile
app.get("/make-server-4588b52f/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    return c.json({ user: profile });
  } catch (error) {
    console.log(`Profile fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Get all household users
app.get("/make-server-4588b52f/household", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const users = await kv.getByPrefix('user:');
    return c.json({ users });
  } catch (error) {
    console.log(`Household fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch household' }, 500);
  }
});

// Get all categories
app.get("/make-server-4588b52f/categories", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const categories = await kv.getByPrefix('category:');
    return c.json({ categories });
  } catch (error) {
    console.log(`Categories fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Add category
app.post("/make-server-4588b52f/categories", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, icon, color } = await c.req.json();
    const id = crypto.randomUUID();
    const category = { id, name, icon, color };

    await kv.set(`category:${id}`, category);
    return c.json({ category });
  } catch (error) {
    console.log(`Category creation error: ${error}`);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

// Update category
app.put("/make-server-4588b52f/categories/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`category:${id}`);

    if (!existing) {
      return c.json({ error: 'Category not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`category:${id}`, updated);
    return c.json({ category: updated });
  } catch (error) {
    console.log(`Category update error: ${error}`);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

// Delete category
app.delete("/make-server-4588b52f/categories/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`category:${id}`);

    // Delete all tasks in this category
    const tasks = await kv.getByPrefix('task:');
    const tasksToDelete = tasks.filter((task: any) => task.categoryId === id);
    for (const task of tasksToDelete) {
      await kv.del(`task:${task.id}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Category deletion error: ${error}`);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// Get all tasks
app.get("/make-server-4588b52f/tasks", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const tasks = await kv.getByPrefix('task:');
    return c.json({ tasks });
  } catch (error) {
    console.log(`Tasks fetch error: ${error}`);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// Add task
app.post("/make-server-4588b52f/tasks", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { title, categoryId, frequency } = await c.req.json();
    const id = crypto.randomUUID();
    const task = {
      id,
      title,
      categoryId,
      frequency,
      completedBy: [],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`task:${id}`, task);
    return c.json({ task });
  } catch (error) {
    console.log(`Task creation error: ${error}`);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// Update task
app.put("/make-server-4588b52f/tasks/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`task:${id}`);

    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`task:${id}`, updated);
    return c.json({ task: updated });
  } catch (error) {
    console.log(`Task update error: ${error}`);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// Delete task
app.delete("/make-server-4588b52f/tasks/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`task:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Task deletion error: ${error}`);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

// Toggle task completion for a user
app.post("/make-server-4588b52f/tasks/:id/toggle", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = c.req.param('id');
    const { userId } = await c.req.json();
    const task = await kv.get(`task:${taskId}`);

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const completedBy = task.completedBy || [];
    const updated = {
      ...task,
      completedBy: completedBy.includes(userId)
        ? completedBy.filter((id: string) => id !== userId)
        : [...completedBy, userId],
    };

    await kv.set(`task:${taskId}`, updated);
    return c.json({ task: updated });
  } catch (error) {
    console.log(`Task toggle error: ${error}`);
    return c.json({ error: 'Failed to toggle task' }, 500);
  }
});

Deno.serve(app.fetch);