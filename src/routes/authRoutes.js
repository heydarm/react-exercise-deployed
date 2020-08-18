const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const { registerValidation, loginValidation } = require("../validation");

// ==================== Register ==================== //
router.post("/register", async (req, res) => {

  // Validation user input
  const { error } = registerValidation.validate(req.body);
  if (error) return res.status(400).send(error.details[0]);

  // Check if email exists
  const user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send({ message: "Email already exists", context: {key: "email"} });

  // Password encryption
  const salt = await bcrypt.genSalt(10);
  const encPass = await bcrypt.hash(req.body.password, salt);

  // Creating new User
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: encPass,
  });

  // Saving new User
  newUser
    .save()
    .then((result) => res.send(result._id))
    .catch((err) => res.status(400).send(err));
});


// ==================== LOGIN ==================== //
router.post("/login", async (req, res) => {

  // Validation user input
  const { error } = loginValidation.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  // Check if email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Wrong email or password");

  // Check password correctness
  const passCorrect = await bcrypt.compare(req.body.password, user.password);
  if (!passCorrect) return res.status(400).send("Wrong email or password");

  // Create JWT
  const token = jwt.sign({ _id: user._id, }, process.env.JWT_SECRET);
  res.header("auth-token", token).send(token);
});

module.exports = router;
