const express = require("express");
const router = express.Router();
const { db } = require("../mysql");
const bcrypt = require("bcrypt");

router.get("/", (req, res, next) => {
  res.render("auth", { auth: 1 });
});

router.post("/", (req, res, next) => {
  const email = req.body["email"];
  const password = req.body["password"];

  db.query(`select * from users where email = '${email}'`, (err, result) => {
    let user;
    if (result.length) {
      user = result[0];
    } else {
      res.render("auth", { auth: 1, error: "User cannot be found." });
      return;
    }
    const hash = user.password;

    bcrypt.compare(password, hash, (e, r) => {
      if (e) throw e;
      // if they do not match
      if (!r) {
        res.render("login", { error: "Credentials provided do not match." });
      }
      // if they do match
      req.session.user = { id: user.id, email: user.email };
      res.redirect("/");
      return;
    });
  });
});

module.exports = router;
