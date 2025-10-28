const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPost = async (req, res) => {
  try {
    const { userId, content } = req.body;

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const postData = JSON.parse(content);

    const post = await prisma.knorrPost.create({
      data: {
        userId,
        content: postData.caption || null,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        imageMimeType: req.file ? req.file.mimetype : null,
        hashtags: postData.hashtags || null,
        knorrProducts: postData.knorrProducts || null,
        isRecipe: postData.isRecipe === 'true',
        prepTime: postData.prepTime || null,
        cookTime: postData.cookTime || null,
        servings: postData.servings || null,
        difficulty: postData.difficulty || null,
        
        // NOUVEAUX CHAMPS
        dietType: postData.dietType || null,
        allergens: postData.allergens || null,
        isAllergenFree: postData.isAllergenFree === 'true',
        
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0
      },
    });

    // Créer/mettre à jour le profil Knorr
    let knorrProfile = await prisma.knorrUserProfile.findUnique({ where: { userId } });
    
    if (!knorrProfile) {
      knorrProfile = await prisma.knorrUserProfile.create({
        data: {
          userId,
          knorrLevel: 1,
          knorrXP: 10,
          rewardPoints: 5,
          badges: JSON.stringify([]),
          followers: JSON.stringify([]),
          following: JSON.stringify([]),
          likedPosts: JSON.stringify([]),
          savedPosts: JSON.stringify([]),
          totalPosts: 1,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0
        }
      });
    } else {
      await prisma.knorrUserProfile.update({
        where: { userId },
        data: {
          totalPosts: { increment: 1 },
          knorrXP: { increment: 10 },
          rewardPoints: { increment: 5 }
        }
      });
    }

    res.status(201).json(post);
  } catch (error) {
    console.error('createPost error:', error);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
};

exports.listPosts = async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query;

    const where = userId ? { userId } : {};

    const posts = await prisma.knorrPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
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

    // Enrichir avec les infos du profil Knorr
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

    res.json(enrichedPosts);
  } catch (error) {
    console.error('listPosts error:', error);
    res.status(500).json({ error: 'Failed to list posts' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await prisma.knorrPost.findUnique({
      where: { id: postId },
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

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Parser les champs JSON pour le frontend
    let postContent = {};
    try {
      postContent = post.content ? JSON.parse(post.content) : {};
    } catch (e) {
      postContent = { caption: post.content };
    }

    const enrichedPost = {
      ...post,
      userName: post.user.displayName || 'Utilisateur',
      mediaUrl: post.imageUrl ? `https://edhecx42-application-mobil.onrender.com${post.imageUrl}` : null,
      type: post.imageMimeType?.includes('video') ? 'video' : 'image',
      content: postContent, // Déjà parsé
      knorrProducts: postContent.knorrProducts ? JSON.parse(postContent.knorrProducts) : [],
      hashtags: postContent.hashtags ? postContent.hashtags.split(' ') : []
    };

    res.json(enrichedPost);
  } catch (error) {
    console.error('getPost error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // Mettre à jour le post
    await prisma.knorrPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } }
    });

    // Mettre à jour le profil de l'utilisateur qui like
    const userProfile = await prisma.knorrUserProfile.findUnique({ where: { userId } });
    const likedPosts = userProfile?.likedPosts ? JSON.parse(userProfile.likedPosts) : [];
    
    if (!likedPosts.includes(postId)) {
      likedPosts.push(postId);
      await prisma.knorrUserProfile.update({
        where: { userId },
        data: {
          likedPosts: JSON.stringify(likedPosts),
          knorrXP: { increment: 2 },
          rewardPoints: { increment: 1 }
        }
      });
    }

    // Récompenser le créateur
    const post = await prisma.knorrPost.findUnique({ where: { id: postId } });
    await prisma.knorrUserProfile.update({
      where: { userId: post.userId },
      data: {
        totalLikes: { increment: 1 },
        knorrXP: { increment: 5 },
        rewardPoints: { increment: 2 }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('likePost error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const { postId } = req.params;

    await prisma.knorrPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    });

    // Récompenser le créateur pour la vue
    const post = await prisma.knorrPost.findUnique({ where: { id: postId } });
    const profile = await prisma.knorrUserProfile.findUnique({ 
      where: { userId: post.userId } 
    });
    
    if (profile) {
      await prisma.knorrUserProfile.update({
        where: { userId: post.userId },
        data: {
          totalViews: { increment: 1 },
          knorrXP: { increment: 1 }
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('incrementViews error:', error);
    res.status(500).json({ error: 'Failed to increment views' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
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

    const enriched = comments.map(c => ({
      ...c,
      userName: c.user.displayName || 'Utilisateur'
    }));

    res.json(enriched);
  } catch (error) {
    console.error('getComments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Content required' });
    }

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content: content.trim()
      },
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

    // Incrémenter le compteur de commentaires du post
    await prisma.knorrPost.update({
      where: { id: postId },
      data: { comments: { increment: 1 } }
    });

    // Récompenser l'auteur du commentaire
    const userProfile = await prisma.knorrUserProfile.findUnique({ where: { userId } });
    if (userProfile) {
      await prisma.knorrUserProfile.update({
        where: { userId },
        data: {
          knorrXP: { increment: 3 },
          rewardPoints: { increment: 1 }
        }
      });
    }

    // Récompenser le créateur du post
    const post = await prisma.knorrPost.findUnique({ where: { id: postId } });
    const postAuthorProfile = await prisma.knorrUserProfile.findUnique({ 
      where: { userId: post.userId } 
    });
    if (postAuthorProfile) {
      await prisma.knorrUserProfile.update({
        where: { userId: post.userId },
        data: {
          totalComments: { increment: 1 },
          knorrXP: { increment: 2 },
          rewardPoints: { increment: 1 }
        }
      });
    }

    res.status(201).json({
      ...comment,
      userName: comment.user.displayName || 'Utilisateur'
    });
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    // Décrémenter le compteur
    await prisma.knorrPost.update({
      where: { id: comment.postId },
      data: { comments: { decrement: 1 } }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('deleteComment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // Incrémenter shares
    await prisma.knorrPost.update({
      where: { id: postId },
      data: { shares: { increment: 1 } }
    });

    // Récompenser le partageur
    await prisma.knorrUserProfile.update({
      where: { userId },
      data: {
        knorrXP: { increment: 5 },
        rewardPoints: { increment: 2 }
      }
    });

    // Récompenser le créateur
    const post = await prisma.knorrPost.findUnique({ where: { id: postId } });
    await prisma.knorrUserProfile.update({
      where: { userId: post.userId },
      data: {
        totalShares: { increment: 1 },
        knorrXP: { increment: 10 },
        rewardPoints: { increment: 5 }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('sharePost error:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
};