import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculatePostScore } from '../utils/feedAlgorithm';

const router = Router();
const prisma = new PrismaClient();

// Middleware d'authentification (à adapter selon votre implémentation)
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  // Votre logique de vérification JWT ici
  // Pour l'exemple, on suppose que vous avez déjà cette fonction
  req.userId = token; // Remplacer par votre vraie logique
  next();
};

// GET /api/feed - Récupérer le feed personnalisé
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, offset = 0 } = req.query;

    // 1. Récupérer les préférences utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        diet: true,
        allergies: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const userPreferences = {
      diet: user.diet || undefined,
      allergies: user.allergies ? JSON.parse(user.allergies) : [],
      seenCategories: [] // TODO: implémenter le tracking des catégories vues
    };

    // 2. Récupérer les posts récents (avec une limite pour la performance)
    const recentPosts = await prisma.knorrPost.findMany({
      take: 200, // Charger plus de posts pour avoir un meilleur pool
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    // 3. Scorer et trier les posts
    const scoredPosts = recentPosts
      .map(post => ({
        ...post,
        score: calculatePostScore(post, userPreferences)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      posts: scoredPosts,
      total: scoredPosts.length,
      userPreferences: {
        diet: user.diet,
        hasAllergies: userPreferences.allergies.length > 0
      }
    });
  } catch (error) {
    console.error('Erreur feed:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/feed/explore - Feed non personnalisé (pour découverte)
router.get('/explore', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const posts = await prisma.knorrPost.findMany({
      take: Number(limit),
      skip: Number(offset),
      orderBy: [
        { likes: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json({ posts });
  } catch (error) {
    console.error('Erreur explore:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;