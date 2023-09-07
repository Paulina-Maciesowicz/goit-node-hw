const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const { config } = require("./config.js");
const { User } = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

const strategyOptions = {
  secretOrKey: config.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(strategyOptions, (payload, done) => {
    User.findOne({ _id: payload.id })
      .then((user) =>
        !user ? done(new Error("User not existing")) : done(null, user)
      )
      .catch(done);
  })
);

export const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user) => {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!user || error || !token || token !== user.token) {
      return res.status(401).json({ message: "Not authorized" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const customAuth = async (req, res, next) => {
  const token = req.headers[".authorization"]?.slice(7);

  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const tokenData = jwt.verify(token, config.JWT_SECRET, { complete: true });
    const user = await User.findOne({ _id: tokenData.payload.id });

    if (!user) return res.status(401).json({ message: "Not authorized" });
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const errorHandler = (_error, _req, res) =>
  res.status(500).json({ message: "Ooopsie!" });
