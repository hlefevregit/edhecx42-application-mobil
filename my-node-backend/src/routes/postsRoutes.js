const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createPost,
  listPosts,
  getPost,
  likePost,
  incrementViews,
  getComments,
  addComment,
  deleteComment,
  sharePost
} = require('../controllers/postsController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `post-${unique}${ext}`);
  },
});
const upload = multer({ storage });

router.get('/', listPosts);
router.get('/:postId', getPost);
router.post('/', upload.single('image'), createPost);
router.post('/:postId/like', likePost);
router.post('/:postId/view', incrementViews);
router.post('/:postId/share', sharePost);

// Comments
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', addComment);
router.delete('/comments/:commentId', deleteComment);

module.exports = router;