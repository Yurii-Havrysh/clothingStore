const express = require("express");
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const JWT = require('../config/jwt');
//Get Users model
let User = require("../models/user");

const jwtSecret = 'z&R8tWb*2k@7Y$L!9sFpCqG3eJ#nTmWp';
const jwt = new JWT(jwtSecret);

//Get register
router.get("/register", function (req, res) {
    res.render('register', {
      title: 'Register'
    })
});

//Post register
router.post("/register", async function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required!').notEmpty();
  req.checkBody('email', 'Email is required!').isEmail();
  req.checkBody('username', 'Username is required!').notEmpty();
  req.checkBody('password', 'Password is required!').notEmpty();
  req.checkBody('password2', 'Passwords do not match!').equals(password);

  const errors = req.validationErrors();

  if (errors) {
      res.render('register', {
          errors: errors,
          user: null,
          title: 'Register'
      });
  } else {
      try {
          const existingUser = await User.findOne({ username: username }).exec();
          if (existingUser) {
              req.flash('danger', 'Username exists, choose another!');
              return res.redirect('/users/register');
          }

          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(password, salt);

          const newUser = new User({
              name: name,
              email: email,
              username: username,
              password: hash,
              admin: 0
          });
          
          await newUser.save();
          
          req.flash('success', 'You are now registered!');
          res.redirect('/users/login');
      } catch (error) {
          console.error(error);
          req.flash('danger', 'Error occurred while registering user.');
          res.redirect('/users/register');
      }
  }
});

//Get login

router.get("/login", function (req, res) {
  if (res.locals.user) res.redirect('/');

  res.render('login', {
    title: 'Log in'
  })
});
//Post login

router.post("/login", function (req, res, next) {
  
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.flash('danger', 'Invalid username or password');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }

      const token = jwt.encode({ userId: user.id, username: user.username });

      res.cookie('jwtToken', token, { httpOnly: true });
      res.redirect('/dashboard');
      console.log(token);
    })
  })(req, res, next);

});

//Get logout

router.get("/logout", function (req, res) {
  req.logout(function(err) {
    if (err) {
      console.error(err);
    }

    req.flash('success', 'You are logged out!');
    res.redirect('/users/login')
  });

  
});
//Exports
module.exports = router;
