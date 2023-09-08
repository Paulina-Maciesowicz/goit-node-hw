const { Router } = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
// const { auth, customAuth } = require("../middlewares/auth.js");
const { auth } = require("../middlewares/auth.js");
const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const Joi = require("joi");

const router = Router();

const schemaRegistration = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string().min(3).max(30).required(),
});

const sanitizeUser = ({ email, _id }) => ({ _id, email });
const hashPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pwd, salt);

  return hash;
};

const validatePassword = (pwd, hash) => bcrypt.compare(pwd, hash);
router.post("/signup", async (req, res) => {
  try {
    const validation = schemaRegistration.validate(req.body);
    if (validation.error) {
      res.status(400).json({ error: validation.error.message });
      return;
    }
    const { email, password } = req.body;
    const isEmailTaken = await User.findOne({ email });
    if (isEmailTaken) return res.status(409).json({ message: "Email in use" });
    const hashedPassword = await hashPassword(password);
    const user = await User.create({ email, password: hashedPassword });
    return res.status(201).json(sanitizeUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const validation = schemaRegistration.validate(req.body);
    if (validation.error) {
      res.status(400).json({ error: validation.error.message });
      return;
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Email or password is wrong" });

    const isValidPassword = await validatePassword(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Email or password is wrong" });

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET);
    return res.status(200).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  }
});

// router.get("/public", (req, res) => res.json({ message: "Public resources" }));
// router.get("/secret/passport", auth, (req, res) =>
//   res.json({ message: "Top secret resources" })
// );

// router.get("/secret/custom", customAuth, (req, res) =>
//   res.json({ message: "Top secret resources", user: req.user.email })
// );

router.get("/logout", auth, async (req, res) => {
  res.sendStatus(204);
  req.user.token = [];
  await req.user.save();
});

router.get("/current", auth, async (req, res) => {
  res.status(200).json({
    email: req.user.email,
    subscription: req.user.subscription,
  });
});

module.exports = router;
