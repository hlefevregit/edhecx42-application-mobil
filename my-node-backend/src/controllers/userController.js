const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: userId, email: `user_${userId.slice(0, 8)}@temp.local` },
      });
    }
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName || null,
      avatarUrl: user.avatarUrl ? `http://localhost:3000${user.avatarUrl}` : null,
      country: user.country || null,
      dob: user.dob || null,
    });
  } catch (e) {
    console.error('getProfile error', e);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { displayName, country, dob } = req.body;

    let avatarUrl;
    if (req.file) avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      await prisma.user.create({
        data: { id: userId, email: `user_${userId.slice(0, 8)}@temp.local` },
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: typeof displayName === 'string' ? displayName : undefined,
        country: typeof country === 'string' ? country : undefined,
        dob: dob ? new Date(dob) : undefined,
        avatarUrl: avatarUrl ?? undefined,
      },
    });

    res.json({
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName || null,
      avatarUrl: updated.avatarUrl ? `http://localhost:3000${updated.avatarUrl}` : null,
      country: updated.country || null,
      dob: updated.dob || null,
    });
  } catch (e) {
    console.error('updateProfile error', e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

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