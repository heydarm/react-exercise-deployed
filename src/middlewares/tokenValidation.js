const jwt = require("jsonwebtoken");

function tokenValidation(req, res, next) {

  // Checking token in header
  const token = req.header("auth_token");
  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).send("Access denied");
  }
}

module.exports = tokenValidation;
