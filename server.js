const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(express.static("public"));
app.use(express.json()); // For parsing JSON request bodies

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "website_db",
  user: "postgres",
  password: "5062"
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error connecting to PostgreSQL:", err);
  }
  console.log("✅ Connected to PostgreSQL database!");
  release();
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/users`);
});

app.post('/api/users', express.json(), async (req, res) => {
  const { username, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
      [username, email]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== BLOG POSTS API =====

// Get all posts with usernames
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.*, users.username 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY posts.created_at DESC
    `);
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT posts.*, users.username 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    res.json({ success: true, post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new post
app.post('/api/posts', express.json(), async (req, res) => {
  const { title, content, user_id } = req.body;
  
  if (!title || !content || !user_id) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide title, content, and user_id' 
    });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO posts (title, content, user_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [title, content, user_id]
    );
    res.json({ success: true, post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});