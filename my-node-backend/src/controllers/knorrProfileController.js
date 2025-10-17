const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getKnorrProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`✅ GET /api/knorr-profiles/${userId}`);

    let profile = await prisma.knorrUserProfile.findUnique({ where: { userId } });

    if (!profile) {
      console.log(`⚠️ Profile not found, creating for user ${userId}`);
      
      // Créer profil par défaut
      profile = await prisma.knorrUserProfile.create({
        data: {
          userId,
          knorrLevel: 1,
          knorrXP: 0,
          rewardPoints: 0,
          badges: JSON.stringify([]),
          followers: JSON.stringify([]),
          following: JSON.stringify([]),
          likedPosts: JSON.stringify([]),
          savedPosts: JSON.stringify([]),
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0
        }
      });
    }

    // Parser JSON fields
    const enrichedProfile = {
      ...profile,
      badges: JSON.parse(profile.badges || '[]'),
      followers: JSON.parse(profile.followers || '[]'),
      following: JSON.parse(profile.following || '[]'),
      likedPosts: JSON.parse(profile.likedPosts || '[]'),
      savedPosts: JSON.parse(profile.savedPosts || '[]')
    };

    console.log(`✅ Profile loaded: level ${enrichedProfile.knorrLevel}, XP ${enrichedProfile.knorrXP}`);
    res.json(enrichedProfile);
  } catch (error) {
    console.error('❌ getKnorrProfile error:', error);
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const { targetUserId, currentUserId } = req.body;

    console.log(`👥 Follow: ${currentUserId} -> ${targetUserId}`);

    // Vérifier que les utilisateurs existent
    let currentUserExists = await prisma.user.findUnique({ where: { id: currentUserId } });
    if (!currentUserExists) {
      return res.status(404).json({ error: 'Current user not found' });
    }

    let targetUserExists = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUserExists) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    // Créer les profils s'ils n'existent pas
    let targetProfile = await prisma.knorrUserProfile.findUnique({ where: { userId: targetUserId } });
    if (!targetProfile) {
      targetProfile = await prisma.knorrUserProfile.create({
        data: { userId: targetUserId }
      });
    }

    let currentProfile = await prisma.knorrUserProfile.findUnique({ where: { userId: currentUserId } });
    if (!currentProfile) {
      currentProfile = await prisma.knorrUserProfile.create({
        data: { userId: currentUserId }
      });
    }

    // Mettre à jour le profil de la cible (ajouter follower)
    const targetFollowers = JSON.parse(targetProfile.followers || '[]');
    if (!targetFollowers.includes(currentUserId)) {
      targetFollowers.push(currentUserId);
      await prisma.knorrUserProfile.update({
        where: { userId: targetUserId },
        data: { followers: JSON.stringify(targetFollowers) }
      });
    }

    // Mettre à jour le profil de l'utilisateur courant (ajouter following)
    const currentFollowing = JSON.parse(currentProfile.following || '[]');
    if (!currentFollowing.includes(targetUserId)) {
      currentFollowing.push(targetUserId);
      await prisma.knorrUserProfile.update({
        where: { userId: currentUserId },
        data: {
          following: JSON.stringify(currentFollowing),
          knorrXP: { increment: 5 }
        }
      });
    }

    console.log(`✅ Follow successful`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ followUser error:', error);
    res.status(500).json({ error: 'Failed to follow user', details: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const { targetUserId, currentUserId } = req.body;

    console.log(`👥 Unfollow: ${currentUserId} -> ${targetUserId}`);

    const targetProfile = await prisma.knorrUserProfile.findUnique({ where: { userId: targetUserId } });
    if (!targetProfile) {
      return res.status(404).json({ error: 'Target profile not found' });
    }

    const currentProfile = await prisma.knorrUserProfile.findUnique({ where: { userId: currentUserId } });
    if (!currentProfile) {
      return res.status(404).json({ error: 'Current profile not found' });
    }

    // Retirer du tableau followers
    const targetFollowers = JSON.parse(targetProfile.followers || '[]').filter(id => id !== currentUserId);
    await prisma.knorrUserProfile.update({
      where: { userId: targetUserId },
      data: { followers: JSON.stringify(targetFollowers) }
    });

    // Retirer du tableau following
    const currentFollowing = JSON.parse(currentProfile.following || '[]').filter(id => id !== targetUserId);
    await prisma.knorrUserProfile.update({
      where: { userId: currentUserId },
      data: { following: JSON.stringify(currentFollowing) }
    });

    console.log(`✅ Unfollow successful`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ unfollowUser error:', error);
    res.status(500).json({ error: 'Failed to unfollow user', details: error.message });
  }
};