const express = require("express");
const router = express.Router();
const User = require("..//module/user");
const sentMail = require("..//util/mail");
const { newToken, verifyaToken } = require("..//util/token");
const Otp = require("..//module/otp");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("..//config/passport");
router.use(passport.initialize());
router.use(passport.session());
passport.serializeUser(function ({user,token}, done) {
  done(null, user._id);
});
passport.deserializeUser(function (id, done) {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err);
        });
});

const {
  formatOfError,
  nameChain,
  emailChain,
  passwordChain,
  loginEmailChain,
  otpSchema,
} = require("../util/valdation");

router.post(
  "/register",
  nameChain(),
  emailChain(),
  passwordChain(),
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).send(formatOfError(error.array()).join(","));
      }
      const user = await User.create(req.body);
      return res.status(200).send(user);
    } catch (err) {
      return res.status(400).send("Bad request");
    }
  }
);

router.post("/login", loginEmailChain(), passwordChain(), async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send(formatOfError(error.array()).join(","));
    }
    const user = req.user;
    const matchPassword = user.checkPassword(req.body.password);
    if (!matchPassword) {
      return res.status(401).send("Password is incorrect");
    }
    const sendData = await sentMail(req.body.email);
    return res.status(200).send(sendData);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Bad request");
  }
});

router.post("/login/otpverification/:id", otpSchema(), async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send(formatOfError(error.array()).join(","));
    }
    const otpData = await Otp.find({ userId: req.params.id }).lean().exec();
    if (otpData.length == 0) {
      return res.status(400).send("Otp is not available");
    }
    const { expireAt } = otpData[otpData.length - 1];
    const hashOtp = otpData[otpData.length - 1].otp;
    if (new Date(expireAt).getTime() < new Date().getTime()) {
      await Otp.deleteMany({ userId: req.params.id });

      return res.status(400).send("Your otp has expired");
    } else {
      const matchOtp = bcrypt.compareSync(req.body.otp, hashOtp);
      if (!matchOtp) {
        return res.status(400).send("Your otp does not match");
      } else {
        await Otp.deleteMany({ userId: req.params.id });
        await User.findByIdAndUpdate(req.params.id, { verifya: true });
        const user = await User.findById(req.params.id).lean().exec();
        const token = newToken(user);
        return res.status(200).send({
          status: "Your account has been successfully verified",
          token: token,
        });
      }
    }
  } catch (err) {
    console.log(err);

    return res.status(400).send("Bad request");
  }
});
router.post("/login/resendotp", loginEmailChain(), async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send(formatOfError(error.array()).join(","));
    }

    const { email } = req.body;
    const user = req.user;

    const sendData = await sentMail(user.email);
    return res.status(200).send(sendData);
  } catch (err) {
    return res.status(400).send("Bad request");
  }
});

router.post("/forgetpassword", loginEmailChain(), async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send(formatOfError(error.array()).join(","));
    }
    const user = req.user;

    const sentData = await sentMail(user.email);
    return res.status(200).send(sentData);
  } catch (err) {
    return res.status(400).send("Bad request");
  }
});

router.post(
  "/forgetpassword/resetpassword/:id",
  passwordChain(),
  async (req, res) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).send(formatOfError(error.array()).join(","));
      }

      await User.findByIdAndUpdate(req.params.id, {
        password: bcrypt.hashSync(req.body.password, 8),
      });
      return res.status(200).send("password reset successfully");
    } catch (err) {
      console.log(err);
      return res.status(400).send("Bad request");
    }
  }
);

router.get("/profile", async (req, res) => {
  try {
    const user = await verifyaToken(req.body.token);
    return res.status(200).send(user);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Bad request");
  }
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async function (req, res) {
    const { user, token } = req.user;
    // Successful authentication, redirect home.
    res.status(200).send({ user, token });
  }
);

router.get('/github',
  passport.authenticate('github',{ scope: [ 'user:email' ] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
 async function(req, res) {
    const { user, token } = req.user;
    // Successful authentication, redirect home.
    res.status(200).send({ user, token });
    
  });

module.exports = router;
