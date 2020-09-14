var express = require("express");
var router = express.Router();
var path = require("path");

const passport = require("passport");
const JWTstrategy = require("passport-jwt").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
//Create a passport middleware to handle user registration
passport.use(
  new JWTstrategy(
    {
      //secret we used to sign our JWT
      secretOrKey: "top_secret",
      //we expect the user to send the token as a query parameter with the name 'secret_token'
      jwtFromRequest: ExtractJWT.fromHeader("authorization"),
    },
    (token, done) => {
      try {
        //Pass the user details to the next middleware
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "957002627887-tk7lirq6b6nfkvi73q9bes3avtssrbjt.apps.googleusercontent.com",
      clientSecret: "AUPaqhjaLBBwnZJXSH5AGOf2",
      callbackURL: "http://localhost:3000/googleRedirect",
    },
    function (accessToken, refreshToken, profile, cb) {
      UserModel.findOne({ "google.id": profile.id }, function (err, user) {
        if (err) return cb(err);

        if (user) {
          // if a user is found, log them in
          return cb(null, user);
        } else {
          // if the user isnt in our database, create a new user
          let newUser = new UserModel();
          newUser.googleid = profile.id;
          newUser.name = profile.displayName;
          newUser.mail = profile.emails[0].value;
          newUser.save(function (err) {
            if (err) throw err;
            return cb(null, newUser);
          });
        }
      });
    }
  )
);
// These functions are required for getting data To/from JSON returned from Providers
passport.serializeUser(function (user, done) {
  console.log("I should have jack ");
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  console.log("I wont have jack shit");
  done(null, obj);
});

router.post("/login", (req, res) => {
  let mail = req.body.mail;
  let password = req.body.password;
  UserModel.findOne({ mail }).then((user) => {
    if (!user) {
      return res.json({ message: "User not found" });
    }
    user.comparePassword(password, function (err, isMatch) {
      if (err) throw err;
      if (isMatch) {
        const body = { _id: user._id, mail: user.mail };
        const token = jwt.sign({ user: body }, "top_secret");
        res.json({
          message: `Log in success ${req.body.mail}  and token is : ` + token,
        });
      } else {
        res.json({ message: `wrong password` });
      }
    });
  });
});
router.post("/signup", (req, res) => {
  UserModel(req.body)
    .save()
    .then((user) => {
      res.json("signup succsessfuly " + user);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views/google-login.html"));
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/googleRedirect",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    let userMail = req.user.mail;
    let user = UserModel.findOne({ userMail });
    if (user) {
      const body = { _id: req.user._id, mail: req.user.mail };
      const token = jwt.sign({ user: body }, "top_secret");
      res.json({
        message: `Log in success ${req.user.mail}  and token is : ` + token,
      });
    } else {
      res.json({
        message: `Log in failed for this mail ${req.user.mail}`,
      });
    }
    console.log(req.user);
  }
);

module.exports = router;
