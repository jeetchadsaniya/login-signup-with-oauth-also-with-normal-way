const JWT = require("jsonwebtoken");
const { badRequestResponse } = require("../response");

const requireSignIn = async (req, res) => {
  try {
    const decode = JWT.verify(
      req.headers.cookie.slice(13),
      process.env.JWT_SECRET
    );
    req.user = decode._id;
    return;
  } catch (error) {
    badRequestResponse(res, "enter valid jwt Token");
    throw new Error("middleware error");
  }
};

module.exports = {
  requireSignIn,
};
