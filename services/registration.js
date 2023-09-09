const { Router } = require("express");
const jwt = require("jsonwebtoken");
const config = require("../config");
const auth = require("../middlewares/auth.js");
const customAuth = require("../middlewares/auth.js");
const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const gravatar = require("gravatar");
const jimp = require("jimp");
const multer = require("multer");
const path = require("path");
const generateUniqueId = require("generate-unique-id");
// const uploadDir = path.join(process.cwd(), "uploads");
// const storeImage = path.join(process.cwd(), "images");

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
    const gravatarAvatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "404",
    });

    const isEmailTaken = await User.findOne({ email });
    if (isEmailTaken) return res.status(409).json({ message: "Email in use" });
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      gravatarAvatar,
    });
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

router.get("/public", (req, res) => res.json({ message: "Public resources" }));
router.get("/secret/passport", auth, (req, res) =>
  res.json({ message: "Top secret resources" })
);

router.get("/secret/custom", customAuth, (req, res) =>
  res.json({ message: "Top secret resources", user: req.user.email })
);

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./tmp");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});
const upload = multer({
  storage: storage,
});

router.patch("/avatars", upload.single("picture"), async (req, res) => {
  try {
    const avatarPath = path.join(__dirname, "../", req.file.path);
    const avatar = await jimp.read(avatarPath);
    await avatar.cover(250, 250).writeAsync(avatarPath);

    const avatarFileName =
      generateUniqueId() + path.extname(req.file.originalname);
    const avatarPublicPath = path.join(
      __dirname,
      "../public/avatars",
      avatarFileName
    );
    await avatar.writeAsync(avatarPublicPath);

    req.user.avatarURL = `/avatars/${avatarFileName}`;
    await req.user.save();

    return res.status(200).json({ avatarURL: req.user.avatarURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unknown error occurred" });
  }
});

module.exports = router;
