const express = require("express");
const router = express.Router();

const random = require("randomstring");

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
  const to = req.body.email;
  const code = random.generate({
    length: 6,
    charset: "numeric"
  });

  const mail = {
    from: user,
    to,
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
