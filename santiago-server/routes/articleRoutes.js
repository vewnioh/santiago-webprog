const express = require('express');
const { getArticles, getArticleBySlug, getArticleById, createArticle, updateArticle, deleteArticle } = require('../controllers/articleController');

const router = express.Router();

router.route('/').get(getArticles).post(createArticle);
router.get('/slug/:slug', getArticleBySlug);
router.route('/:id([0-9a-f]{24})').get(getArticleById).put(updateArticle).delete(deleteArticle);

module.exports = router;
