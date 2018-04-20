var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../config/main');


exports.checkForValidToken= function (req, res, cb) {
    if(req){
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({
        code: 401,
        message: "Please provide auth token"
    })
    jwt.verify(token, config.secret, function (err, decoded) {
        console.log(err)
        if (err) return cb(new Error("Error in verifying token"))
        console.log(decoded)
        User.findById(decoded.id, function (err, user) {
            console.log("token verified")
            console.log(err)
            if (err) return cb(new Error("Error in finding user using token"))
            if (!user) return cb(new Error())
            console.log(user.accessToken)
            if (user.accessToken === '' || user.accessToken === null || !user.accessToken) {
                console.log("inside no accs")
                return cb(new Error())
            } else if (user.accessToken != token) {
                return cb(new Error())

            }
            return cb(null, user)
        })
    })
    }
}