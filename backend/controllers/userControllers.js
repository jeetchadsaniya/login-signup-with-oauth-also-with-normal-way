const {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
  notFoundResponse,
} = require("../response");
const { connection } = require("../db/connectDb");
const JWT = require("jsonwebtoken");



const registerController = async (req, res) => {

  try {
    const { fullname, email, password } = req.body;

    if (!fullname.trim() || !email || !password) {
      badRequestResponse(res, "All fields are required");
      return;
    }

    if (password.length < 5) {
      badRequestResponse(res, "Password must be at least 5 characters long");
      return;
    }
    const checkUserQuery = `SELECT * FROM users WHERE email = ?`;
    connection.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.log("Error checking user:", err.message);
        serverErrorResponse(res, "Server error");
        return;
      }

      if (results.length > 0) {
        badRequestResponse(res, "User already exists");
        return;
      }

      const insertUserQuery = `INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)`;
      connection.query(
        insertUserQuery,
        [fullname, email, password],
        (err, insertResult) => {
          if (err) {
            console.log("Error registering user:", err.message);
            serverErrorResponse(res, "Server error");
            return;
          }
          const insertedData = {
            id: insertResult.insertId,
            fullname: fullname,
            email: email,
            password: password,
          };
          successResponse(res, insertedData, "User registered successfully");
          return;
        }
      );
    });
  } catch (error) {
    console.error(error);
    serverErrorResponse(res, "Server error");
    return;
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      badRequestResponse(res, "All fields are required");
      return;
    }

    const getUserQuery = `SELECT * FROM users WHERE email = ?`;
    connection.query(getUserQuery, [email], (err, results) => {
      if (err) {
        console.error("Error getting user:", err.message);
        serverErrorResponse(res, "Server error");
        return;
      }

      if (results.length === 0) {
        notFoundResponse(res, "User not signed up");
        return;
      }

      const user = results[0];

      if (user.password !== password) {
        badRequestResponse(res, "Invalid password");
        return;
      }

      const rememberMeExpiration = rememberMe ? 7 : 1;
      const access_token = JWT.sign({ _id: user.id }, process.env.JWT_SECRET, {
        expiresIn: `${rememberMeExpiration}d`,
      });
      if (rememberMe) {
        res.setHeader(
          "Set-Cookie",
          `access_token=${access_token};Max-age=${7*3600}; Path=/; HttpOnly; secure; SameSite=none`
        );
      } else {
        
        res.setHeader(
          "Set-Cookie",
          `access_token=${access_token};Max-age=""; Path=/; HttpOnly; secure; SameSite=none`
        );
      }
      
      
      successResponse(res, access_token, "Login In successfully ");
      return;
    });
  } catch (error) {
    console.error("Error in loginController:", error);
    serverErrorResponse(res, "Server error");
    return;
  }
};

const changePassword = async (req,res) => {
  try {
    const { access_token, newPassword } = req.body;
    let decode;
    try {
      decode =  JWT.verify(access_token , process.env.JWT_SECRET);
    } catch (error) {
      badRequestResponse(res,"enter valid jwt Token or your token expires");
      return;
    }
    const userId = decode._id;

    if (!newPassword) {
      badRequestResponse(res, "New password is required");
      return;
    }

    if (newPassword.length < 5) {
      badRequestResponse(res, "Password must be at least 5 characters long");
      return;
    }

    const getUserQuery = `SELECT * FROM users WHERE id = ?`;
    connection.query(getUserQuery, [userId], (err, results) => {
      if (err) {
        console.error("Error getting user:", err.message);
        serverErrorResponse(res, "Server error");
        return
      }

      if (results.length === 0) {
        notFoundResponse(res, "User not found");
      }

      const user = results[0];

      if (user["is_password_change"]) {
        badRequestResponse(res,"you already password change it, password only change it for only one time");
        return;
      }

      const updatePasswordQuery = `UPDATE users SET password = ?, is_password_change = ? WHERE id = ?`;
      connection.query(updatePasswordQuery, [newPassword, true, userId], (err, result) => {
        if (err) {
          console.error("Error updating password:", err.message);
          serverErrorResponse(res, "Server error");
          return;
        }
        user.password = newPassword
        successResponse(res, user, "Password changed successfully");
        return;
      });
    });

  } catch (error) {
    console.error("Error in changePassword Controller:", error);
    serverErrorResponse(res, "Server error");
    return;
  }
}

const getDashboard = async (req, res) => {
  successResponse(res, "data", "get Dashboard");
};

module.exports = {
  registerController,
  loginController,
  getDashboard,
  changePassword
};
