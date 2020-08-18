const router = require("express").Router();
const tokenValidation = require("../middlewares/tokenValidation");
const User = require("../model/User");

router.get("/dashboard", tokenValidation, async (req, res) => {
  console.log("private route")
  const userData = await User.findOne({_id: req.user._id});
  res.send({ email: userData.email, name: userData.name });
});

module.exports = router;
