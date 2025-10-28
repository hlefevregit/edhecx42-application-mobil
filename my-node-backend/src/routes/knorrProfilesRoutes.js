const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('✅ knorrProfilesRoutes loaded');

function toArrayCount(jsonStr) {
  try {
    const arr = JSON.parse(jsonStr || '[]');
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function normalizeProfile(p) {
  return {
    ...p,
    bio: '',
    level: p.knorrLevel ?? 1,
    points: p.rewardPoints ?? 0,
    postsCount: p.totalPosts ?? 0,
    followersCount: toArrayCount(p.followers),
    followingCount: toArrayCount(p.following),
    // Nouvelles données gamification
    currentStreak: p.currentStreak ?? 0,
    completedChallenges: p.completedChallenges ?? 0,
    leaderboardRank: p.leaderboardRank ?? null,
  };
}

// GET /api/knorr-profiles/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 GET /api/knorr-profiles/' + userId);

    let profile = await prisma.knorrUserProfile.findFirst({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, displayName: true, avatarUrl: true }
        }
      }
    });

    if (!profile) {
      // Vérifier que l'utilisateur existe
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Créer un profil conforme à ton schéma actuel
      profile = await prisma.knorrUserProfile.create({
        data: {
          userId,
          knorrLevel: 1,
          knorrXP: 0,
          rewardPoints: 0,
          badges: null,
          followers: '[]',
          following: '[]',
          likedPosts: '[]',
          savedPosts: '[]',
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
        },
        include: {
          user: {
            select: { id: true, email: true, displayName: true, avatarUrl: true }
          }
        }
      });
      console.log('✅ Profile created (defaults)');
    }

    return res.json(normalizeProfile(profile));
  } catch (error) {
    console.error('❌ Get Knorr profile error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// PUT /api/knorr-profiles/:userId
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Ne mettre à jour que les champs existants dans ton schéma
    const allowed = [
      'knorrLevel', 'knorrXP', 'rewardPoints', 'badges',
      'followers', 'following', 'likedPosts', 'savedPosts',
      'totalPosts', 'totalViews', 'totalLikes', 'totalComments', 'totalShares'
    ];
    const data = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) data[k] = req.body[k];
    }

    let profile = await prisma.knorrUserProfile.findFirst({ where: { userId } });

    if (!profile) {
      // créer si absent
      profile = await prisma.knorrUserProfile.create({
        data: {
          userId,
          knorrLevel: 1,
          knorrXP: 0,
          rewardPoints: 0,
          badges: null,
          followers: '[]',
          following: '[]',
          likedPosts: '[]',
          savedPosts: '[]',
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          ...data,
        },
        include: {
          user: { select: { id: true, email: true, displayName: true, avatarUrl: true } }
        }
      });
    } else {
      profile = await prisma.knorrUserProfile.update({
        where: { id: profile.id },
        data,
        include: {
          user: { select: { id: true, email: true, displayName: true, avatarUrl: true } }
        }
      });
    }

    return res.json(normalizeProfile(profile));
  } catch (error) {
    console.error('❌ Update Knorr profile error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;