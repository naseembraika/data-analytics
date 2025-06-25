const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');

// Home page
router.get('/', forwardAuthenticated, (req, res) => {
    res.render('index', {
        title: 'Welcome to Document Manager'
    });
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        user: req.user
    });
});

module.exports = router; 