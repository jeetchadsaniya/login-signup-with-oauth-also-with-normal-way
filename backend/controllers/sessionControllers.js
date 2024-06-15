const { connection } = require("../db/connectDb");
const { badRequestResponse } = require("../response");
const {
  getGoogleOAuthTokens,
  getGoogleUser,
} = require("../services/userService");
const JWT = require("jsonwebtoken");

async function googleOauthHandler(req, res) {
  // get the code from qs
  const code = `${req.query.code}`;

  try {
    // get the id and access token with the code
    const { id_token, access_token } = await getGoogleOAuthTokens(code);

    // get user with tokens
    const googleUser = await getGoogleUser({ id_token, access_token });
    // console.log(jwt.decode(id_token));


    if (!googleUser.verified_email) {
      badRequestResponse(res, "Google account is not verified");
      return;
    }

    const getUserQuery = `SELECT * FROM users WHERE email = ?`;
    connection.query(getUserQuery, [googleUser.email], (err, results) => {
      if (err) {
        console.error("Error getting user:", err.message);
        serverErrorResponse(res, "Server error");
        return;
      }
      let insertedData;
      if (results.length === 0) {
        const insertUserQuery = `INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)`;
        connection.query(
          insertUserQuery,
          [googleUser.name, googleUser.email, "oauth"],
          (err, insertResult) => {
            if (err) {
              console.log("Error registering user:", err.message);
              serverErrorResponse(res, "Server error");
              return;
            }
             insertedData = {
              id: insertResult.insertId,
              fullname: googleUser.name,
              email: googleUser.email,
              password: "oauth",
            };
          }
        );
      } else {
        insertedData = {id : results[0].id,
          fullname : results[0].fullname,
          email : results[0].email,
          password : results[0].password
        }
      }

      const access_token = JWT.sign({ _id: insertedData.id }, process.env.JWT_SECRET, {
        expiresIn: `7d`,
      });
      res.setHeader('Set-Cookie', [`access_token=${access_token}; Path=/; Max-Age=${7*3600}; HttpOnly; SameSite=None; Secure`]);
      res.writeHead(302, { "Location": "http://127.0.0.1:5500/frontend/pages/dashboard.html" });
    res.end();
    });
  } catch (error) {
    res.writeHead(302, { Location: "http://127.0.0.1:5500/frontend/pages/login.html" });
    res.end();
  }
}

module.exports = {
  googleOauthHandler,
};
