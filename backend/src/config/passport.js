const GoogleStrategy = require("passport-google-oauth20").Strategy;
var GitHubStrategy = require('passport-github').Strategy;
const passport = require("passport");
const User = require("..//module/user");
const { v4: uuidv4 } = require("uuid");
const { newToken } = require("..//util/token");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.URL}/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      let user = await User.findOne({ email: profile._json.email })
        .lean()
        .exec();
      if (!user) {
        user = await User.create({
          name: profile._json.name,
          email: profile._json.email,
          password: uuidv4(),
          profile_pic: profile._json.picture,
          verifya: true,
        });
      }
      const token = newToken(user);
      cb(null, { user, token });
    }
  )
);
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.URL}/auth/github/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
        // console.log(profile);
        
      let user = await User.findOne({ email: profile._json.login })
        .lean()
        .exec();
      if (!user) {
        user = await User.create({
          name: profile._json.name,
          email: profile._json.login,
          password: uuidv4(),
          profile_pic: profile.photos[0].value,
          verifya: true,
        });
      }
      const token = newToken(user);
      done(null, { user, token });
    }
  )
);

module.exports = passport;
