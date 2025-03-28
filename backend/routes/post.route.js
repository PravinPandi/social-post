import express from 'express';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/post.controller.js';

const router = express.Router();

router.route('/').get(getPosts).post(createPost);
router.route('/:id').put(updatePost).delete(deletePost);

export default router;
