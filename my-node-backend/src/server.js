// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const postsRoutes = require('./routes/postsRoutes');
const feedRoutes = require('./routes/feedRoutes');
const knorrProfilesRoutes = require('./routes/knorrProfilesRoutes');
const fridgeRoutes = require('./routes/fridgeRoutes');

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


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/knorr-profiles', knorrProfilesRoutes);
app.use('/api/fridge', fridgeRoutes);

app.get('/', (req, res) => {
  res.send('✅ Knorr API is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // DEBUG: Lister toutes les routes
  console.log('\n📍 Registered routes:');
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`  ${Object.keys(r.route.methods)} ${r.route.path}`);
    } else if (r.name === 'router') {
      r.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(`  ${Object.keys(handler.route.methods)} ${handler.route.path}`);
        }
      });
    }
  });
});