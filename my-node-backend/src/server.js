const express = require('express');
const userRoutes = require('./routes/userRoutes');
const fridgeRoutes = require('./routes/fridgeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/fridge', fridgeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});