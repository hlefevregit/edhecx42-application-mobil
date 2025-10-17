const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const fridgeRoutes = require('./routes/fridgeRoutes');
const path = require('path');
const postsRoutes = require('./routes/postsRoutes');
const knorrProfileRoutes = require('./routes/knorrProfileRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Activer CORS
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:8000'],
  credentials: true
}));

app.use(express.json());

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.use('/api/users', userRoutes);
app.use('/api/fridge', fridgeRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/knorr-profiles', knorrProfileRoutes);

// Servir les fichiers uploadés (dev)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// A adapter où tu publies un post (ex: PostCreateScreen)
const publishPost = async ({ userId, content, imageUri }) => {
  const form = new FormData();
  form.append('userId', userId);
  if (content) form.append('content', content);
  if (imageUri) {
    // Expo: il faut fournir name et type
    form.append('image', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg'
    });
  }

  const res = await fetch('http://localhost:3000/api/posts', {
    method: 'POST',
    body: form
  });
  const data = await res.json();
  return data;
};