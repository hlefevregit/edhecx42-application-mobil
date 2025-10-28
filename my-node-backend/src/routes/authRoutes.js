const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { customAlphabet } = require('nanoid');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 25);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // ✅ Correctement passer juste la string email
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email }  // ou simplement { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: nanoid(),
        email,
        password: hashedPassword,
        displayName,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('📥 Login request body:', req.body); // DEBUG
    
    const { email, password } = req.body;
    
    console.log('📧 Email type:', typeof email, 'Value:', email); // DEBUG
    console.log('🔑 Password type:', typeof password); // DEBUG

    if (typeof email !== 'string') {
      return res.status(400).json({ error: 'Email doit être une string' });
    }

    // ✅ Correctement passer juste la string email
    const user = await prisma.user.findUnique({ 
      where: { email: email }  // ou simplement { email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Déconnexion réussie' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        diet: true,
        allergies: true,
        createdAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;