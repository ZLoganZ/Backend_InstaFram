import { Router } from 'express';

import { asyncHandler } from '../libs/utils';
import CommentController from '../controllers/commentController';

const router = Router();

router.get('/replies/:commentID', asyncHandler(CommentController.getRepliesByCommentID));
router.get('/:postID', asyncHandler(CommentController.getCommentsByPostID));
router.post('/', asyncHandler(CommentController.createComment));
router.put('/:commentID/like', asyncHandler(CommentController.likeComment));
router.put('/:commentID', asyncHandler(CommentController.updateComment));
router.delete('/:commentID', asyncHandler(CommentController.deleteComment));

export default router;
