const { PrismaClient } = require('@prisma/client');
const { calculatePostScore } = require('../utils/feedAlgorithm');

const prisma = new PrismaClient();

exports.getPersonalizedFeed = async (req, res) => {
  try {
    console.log('🛰️ /api/feed query:', req.query);
    console.log('🧑 req.user:', req.user);

    const { userId, page = '1', limit = '10' } = req.query || {};
    const uid = userId || req.user?.id;

    if (!uid) {
      console.error('❌ Missing userId - query:', req.query, 'user:', req.user);
      return res.status(400).json({ error: 'Missing userId in query or auth context' });
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    // 1. Récupérer les préférences utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        diet: true,
        allergies: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userPreferences = {
      diet: user.diet || undefined,
      allergies: user.allergies ? JSON.parse(user.allergies) : [],
      seenCategories: [] // TODO: tracker les catégories vues
    };

    // 2. Récupérer les posts récents
    const recentPosts = await prisma.knorrPost.findMany({
      take: 200, // Pool plus large pour scoring
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
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
      .slice(offset, offset + limit);

    // 4. Enrichir les posts comme dans listPosts
    const enrichedPosts = await Promise.all(scoredPosts.map(async (post) => {
      const knorrProfile = await prisma.knorrUserProfile.findUnique({
        where: { userId: post.userId }
      });

      return {
        ...post,
        userName: post.user.displayName || 'Utilisateur',
        userLevel: knorrProfile?.knorrLevel || 1,
        mediaUrl: post.imageUrl ? `https://edhecx42-application-mobil.onrender.com${post.imageUrl}` : null,
        type: post.imageMimeType?.includes('video') ? 'video' : 'image',
        knorrProducts: post.knorrProducts ? JSON.parse(post.knorrProducts) : [],
        hashtags: post.hashtags ? post.hashtags.split(' ') : []
      };
    }));

    res.json({
      posts: enrichedPosts,
      total: enrichedPosts.length,
      userPreferences: {
        diet: user.diet,
        hasAllergies: userPreferences.allergies.length > 0
      }
    });
  } catch (error) {
    console.error('❌ getPersonalizedFeed error:', error);
    return res.status(500).json({ error: 'Failed to get personalized feed', details: error.message });
  }
};

exports.getExploreFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await prisma.knorrPost.findMany({
      take: limit,
      skip: offset,
      orderBy: [
        { likes: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    });

    // Enrichir les posts
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const knorrProfile = await prisma.knorrUserProfile.findUnique({
        where: { userId: post.userId }
      });

      return {
        ...post,
        userName: post.user.displayName || 'Utilisateur',
        userLevel: knorrProfile?.knorrLevel || 1,
        mediaUrl: post.imageUrl ? `https://edhecx42-application-mobil.onrender.com${post.imageUrl}` : null,
        type: post.imageMimeType?.includes('video') ? 'video' : 'image',
        knorrProducts: post.knorrProducts ? JSON.parse(post.knorrProducts) : [],
        hashtags: post.hashtags ? post.hashtags.split(' ') : []
      };
    }));

    res.json({ posts: enrichedPosts });
  } catch (error) {
    console.error('getExploreFeed error:', error);
    res.status(500).json({ error: 'Failed to get explore feed' });
  }
};