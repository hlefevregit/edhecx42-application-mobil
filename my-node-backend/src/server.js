const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const fridgeRoutes = require('./routes/fridgeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Activer CORS
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006'],
  credentials: true
}));

app.use(express.json());

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.use('/api/users', userRoutes);
app.use('/api/fridge', fridgeRoutes);

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});