const express = require("express");
const router = express.Router();
const { db } = require("../mysql");

const random = require("randomstring");
const bcrypt = require("bcrypt");

const dotenv = require("dotenv").config();
const nodemailer = require("nodemailer");
const user = process.env.EMAIL_ADDR;
const pass = process.env.EMAIL_PASS;

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass
  }
});

// '/register' route
router.get("/", (req, res, next) => {
  res.render("auth", { auth: 0 });
});

// '/register/verify' router — register form submission
router.post("/verify", (req, res, next) => {
  const userEmail = req.body["email"];
  const userPass = req.body["new-password"];
  // generate a random 6 digit Verification code
  const code = random.generate({
    length: 6,
    charset: "numeric"
  });

  // encrypt user password and store user data with auth code
  bcrypt.hash(userPass, 10, function(err, hash) {
    if (err) throw err;
    db.query(
      `insert into users (email, password, auth_code) values ('${userEmail}', '${hash}', '${code}')`,
      (err, result) => {
        if (err) throw err;
      }
    );
  });

  // create mail object and send email using nodemailer
  const mail = {
    from: user,
    to: userEmail,
    subject: "Tisk Task Account Verification",
    text: code
  };

  mailer.sendMail(mail, (error, info) => {
    if (error) {
      const err = new Error("Email failed.");
      err.status = 500;
      next(err);
    } else {
      res.render("verify");
    }
  });
});

module.exports = router;
