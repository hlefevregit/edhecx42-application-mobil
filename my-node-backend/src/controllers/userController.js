const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.registerUser = async (req, res) => {
  const { email, password, displayName, allergies, preferences, dietStyle, productsToAvoid, budget } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        displayName,
        allergies,
        preferences,
        dietStyle,
        productsToAvoid,
        budget,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'User registration failed' });
  }
};

exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
};

exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { displayName, allergies, preferences, dietStyle, productsToAvoid, budget } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName,
        allergies,
        preferences,
        dietStyle,
        productsToAvoid,
        budget,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};