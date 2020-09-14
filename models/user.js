var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var userSchema = new mongoose.Schema({
  name: String,
  mail: { type: String },
  password: String,
  googleid: String,
});
userSchema.pre(
  "save",
  function (next) {
    var user = this;
    if (!user.isModified("password")) {
      return next();
    }
    bcrypt.hash(user.password, 10).then((hashedPassword) => {
      user.password = hashedPassword;
      next();
    });
  },
  function (err) {
    next(err);
  }
);

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
