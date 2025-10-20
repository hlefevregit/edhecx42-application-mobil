// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const fridgeRoutes = require('./routes/fridgeRoutes');
const postsRoutes = require('./routes/postsRoutes');
const knorrProfileRoutes = require('./routes/knorrProfileRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 CORS (prod + local)
const allowedOrigins = [
  // --- PROD (remplace par tes vraies URLs de front) ---
  'https://hlefevregit.github.io',                 // Pages user site
  'https://hlefevregit.github.io/edhecx42-application-mobil',      // Pages projet
  // 'https://ton-projet.vercel.app',             // (si tu utilises Vercel)

  // --- DEV local ---
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:8081',
  'http://localhost:19006',
];

// CORS avant les routes
app.use(cors({
  origin(origin, cb) {
    // autorise requêtes sans Origin (curl/healthchecks) et origins listées
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true, // si tu utilises des cookies/session
}));

// Préflight global
app.options('*', cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Route de santé simple
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Tes routes API
app.use('/api/users', userRoutes);
app.use('/api/fridge', fridgeRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/knorr-profiles', knorrProfileRoutes);

// Fichiers uploadés (si besoin)
app.use('/uploads', require('express').static(path.join(__dirname, '..', 'uploads')));

// 404 API
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Launch
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});