const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { forwardAuthenticated } = require('../middleware/auth');
const User = require('../models/User');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
    res.render('login', {
        title: 'Login'
    });
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});

// Register Handle
router.post('/register', (req, res) => {
    const { username, name, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!username || !name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            title: 'Register',
            errors,
            username,
            name,
            email
        });
    } else {
        // Check if username or email already exists
        User.findOne({ $or: [{ email: email }, { username: username }] }).then(user => {
            if (user) {
                if (user.email === email) {
                    errors.push({ msg: 'Email is already registered' });
                }
                if (user.username === username) {
                    errors.push({ msg: 'Username is already taken' });
                }
                res.render('register', {
                    title: 'Register',
                    errors,
                    username,
                    name,
                    email
                });
            } else {
                const newUser = new User({
                    username,
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/users/login');
    });
});

module.exports = router; 