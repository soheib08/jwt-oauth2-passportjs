passport.use(
  new GoogleStrategy(
    {
      clientID:
        "957002627887-tk7lirq6b6nfkvi73q9bes3avtssrbjt.apps.googleusercontent.com",
      clientSecret: "AUPaqhjaLBBwnZJXSH5AGOf2",
      callbackURL: "http://localhost:3000/googleRedirect",
    },
    function (accessToken, refreshToken, profile, done) {
      //console.log(accessToken, refreshToken, profile)
      console.log("GOOGLE BASED OAUTH VALIDATION GETTING CALLED");
      req.login(profile, function (err) {
        console.log(err);
      });
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  console.log("I should have jack ");
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  console.log("I wont have jack shit");
  done(null, obj);
});

router.get("/", (req, res) => res.send("Hello World!"));
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views/google-login.html"));
});

return res.json({ token });
