const { connection } = require("../db/connectDb");
const {
  successResponse,
  serverErrorResponse,
  notFoundResponse,
} = require("../response");
const JWT = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendForgetPasswordMail = async (req, res) => {
  try {
    const { email } = req.body;
    const getUserQuery = `SELECT * FROM users WHERE email = ?`;
    connection.query(getUserQuery, [email], async (err, results) => {
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
      const access_token = JWT.sign({ _id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.EMAIL_ID}`,
          pass: `${process.env.EMAIL_PASS}`,
        },
      });

      const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Change Password</title>
  </head>
  <body>
      <header>
          <h1>Change Password</h1>
      </header>
  
      <main>
          <section>
              <h3>Click Link to <a href="http://127.0.0.1:5500/frontend/pages/change_password.html?access_token=${access_token}">Change Password</a></h3>
          </section>
      </main>
  
  </body>
  </html>
  `;
      const info = await transporter.sendMail({
        from: `${process.env.EMAIL_ID}`,
        to: user.email,
        subject: "Change Password!!",
        html: htmlContent,
      });
      console.log("Forget Password mail send");

      const updateQuery = `UPDATE users SET is_password_change = ? WHERE id = ?`;
      connection.query(updateQuery, [false,user.id], (updateErr, updateResult) => {
        if (updateErr) {
          console.log("Error updating user:", updateErr.message);
          serverErrorResponse(res, "Server error");
          return;
        }
      });

      successResponse(res, info, "Mail Send Successfully");
    });
  } catch (error) {
    console.error("Error in Server:", error);
    serverErrorResponse(res, "Server error");
    return;
  }
};

module.exports = {
  sendForgetPasswordMail,
};
