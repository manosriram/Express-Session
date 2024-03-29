const express = require("express");
const router = express.Router();
const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const key = require("../Setup/url").secret;

router.get("/userInfo", async (req, res) => {
    if (req.session.user)
        return res.json({success: true, user: req.session.user});

    return res.json({success: false});
});

router.post("/register", async (req, res) => {
    const { username, email, password, description } = req.body;

    const user = await User.findOne({ email });

    if (user) {
        return res.json({ success: false, errMessage: "User Already Exists" });
    } else {
        let newUser = new User({
            username,
            email,
            password,
            description
        });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                newUser.password = hash;
                newUser.save().catch(err => console.log(err));
            });
        });
        return res.json({
            success: true,
            errMessage: "User Registered Successfully"
        });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.json({ success: false, errMessage: "User Doesn't exist." });
    } else {
        bcrypt
            .compare(password, user.password)
            .then(isCorrect => {
                if (!isCorrect)
                    return res.json({
                        success: false,
                        errMessage: "Password Incorrect."
                    });
                else {
                    req.session.user = user;
                    return res.json({ success: true, errMessage: "Logged In..." });
            }
    })
    .catch(err => console.log(err));
}
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    req.logout();
    return res.json({success: true});
});

module.exports = router;
