const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = '930883947615-3ful7pfe6k38qbdqfph7ja2lp76spahf.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const { email, password, displayName, preferences } = req.body;

    // Vérifier si l'utilisateur existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password: hashedPassword,
        displayName: displayName || null,
        // Stocker les préférences (allergies, régimes, etc.)
        allergies: preferences?.allergies ? JSON.stringify(preferences.allergies) : null,
        diet: preferences?.diet || null,
        location: preferences?.location ? JSON.stringify(preferences.location) : null,
        pushNotif: preferences?.pushNotif ?? true,
        promoNotif: preferences?.promoNotif ?? false,
      },
    });

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

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
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl ? `https://edhecx42-application-mobil.onrender.com${user.avatarUrl}` : null,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Vérifier le token Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const displayName = payload.name;
    const avatarUrl = payload.picture;

    // Chercher ou créer l'utilisateur
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          id: `google_${googleId}`,
          email,
          displayName,
          avatarUrl,
          password: null, // Pas de password pour Google login
        },
      });
    } else {
      // Mettre à jour l'avatar si nécessaire
      if (avatarUrl && !user.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl },
        });
      }
    }

    // Générer un token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
};