const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          return done(null, user);
        }

        // Check if user exists with email
        const email = profile.emails[0].value;
        user = await User.findOne({ email });

        if (user) {
          // Update user with googleId
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          avatar: profile.photos[0].value,
          password: 'social_login_' + Math.random().toString(36).slice(-8) // Dummy password
        });

        await newUser.save();
        return done(null, newUser);

      } catch (err) {
        console.error(err);
        return done(err, null);
      }
    }
  ));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });

        if (user) {
          return done(null, user);
        }

        const email = profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`;
        user = await User.findOne({ email });

        if (user) {
          user.facebookId = profile.id;
          if (!user.avatar && profile.photos) user.avatar = profile.photos[0].value;
          await user.save();
          return done(null, user);
        }

        const newUser = new User({
          facebookId: profile.id,
          name: profile.displayName,
          email: email,
          avatar: profile.photos ? profile.photos[0].value : '',
          password: 'social_login_' + Math.random().toString(36).slice(-8)
        });

        await newUser.save();
        return done(null, newUser);

      } catch (err) {
        console.error(err);
        return done(err, null);
      }
    }
  ));
}

module.exports = passport;
