var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config/main');
var nodemailer = require('nodemailer');

// CREATES A NEW USER
router.post('/register', function (req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  console.log("hashed password " + hashedPassword)
  User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      company: req.body.company,
      dob: req.body.dob,
      gender: req.body.gender,
      country: req.body.country,
      password: hashedPassword,
      createdByAdmin: true,
      deactivated: false
    },
    function (err, user) {
      console.log(err)
      if (err) return res.status(500).send(err.message)


      // create a token
      var token = jwt.sign({
        id: user._id
      }, config.secret);
      user.accessToken = token

      user.save(function (err) {
        console.error(err)
      })
      res.status(200).send({
        userId: user._id
      });
    });
});

//login api
router.post('/login', function (req, res) {
  console.log(req.body.email)
  User.findOne({
    email: req.body.email
  }, function (err, user) {
    console.log("error in getting user " + err)
    if (err) return res.status(500).send("Error in server")
    if (!user) return res.status(404).send({
      code: 33,
      message: "Please provide valid email/password."
    })
    if (user.deactivated) return res.status(403).send({
      code: 31,
      message: "Your account is temporarily deactivated."
    })
    var verifyPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!verifyPassword) return res.status(401).send({
      code: 33,
      message: "Please provide valid email/password."
    })
    console.log("user after login " + user)
    var token = jwt.sign({
      id: user._id
    }, config.secret);
    console.log(token)
    user.accessToken = token;
    user.save(function (err) {
      if (err) console.error('ERROR!');
    })
    res.status(200).send({
      token: token,
      userId: user._id,
      tempPassword: false
    })
  })
})

//to check user is present or not
router.get('/checkPresent/:email', function (req, res) {
  User.findOne({
    email: req.params.email
  }, function (err, user) {
    if (err) return res.status(500).send({
      code: 34,
      message: "Provided email does not exists. "
    })
    if (!user) return res.status(404).send({
      code: 34,
      message: "Provided email does not exists. "
    })
    if (user.deactivated) return res.status(403).send({
      code: 31,
      message: "Your account is temporarily deactivated."
    })
    res.status(200).send({
      code: 200,
      message: "User exist"
    })
  });

})
// RETURNS ALL THE USERS IN THE DATABASE
router.get('/all', function (req, res) {
  checkForValidToken(req, res, function (err, user) {
    console.log("came back")
    console.log(err)
    console.log(user)
    if (err) {
      console.log("erre in validation")
      return res.status(401).send({
        code: 401,
        message: "Failed to authenticate token."
      })
    }

    User.find({}, function (err, users) {
      if (err) return res.status(500).send("There was a problem finding the users.");
      if (!users) return res.status(404).send("No users found")
      res.status(200).send(users);
    });
  });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', function (req, res) {
  checkForValidToken(req, res, function (err, user) {
    console.log("came back")
    console.log(err)
    console.log(user)
    if (err) {
      console.log("erre in validation")
      return res.status(401).send({
        code: 401,
        message: "Failed to authenticate token."
      })
    }


    User.findById(req.params.id, function (err, user) {
      if (err) return res.status(500).send({
        code: 43,
        message: "There was a problem finding the user."
      });
      if (!user) return res.status(404).send({
        code: 44,
        message: "Provided argument value is invalid"
      });
      return res.status(200).send({
        profile: user,
        referral: {}
      });

    });
  });


});
// DELETES A USER FROM THE DATABASE

router.delete('/:id', function (req, res) {
  checkForValidToken(req, res, function (err, user) {
    console.log("came back")
    console.log(err)
    console.log(user)
    if (err) {
      console.log("erre in validation")
      return res.status(401).send({
        code: 401,
        message: "Failed to authenticate token."
      })
    }
    User.findByIdAndRemove(req.params.id, function (err, user) {
      if (err) return res.status(500).send("User does not exists.");
      res.status(200).send({
        code: 200,
        message: "User was deleted."
      });
    });
  });
});
// UPDATES A SINGLE USER IN THE DATABASE
router.put('/update-user/:id', function (req, res) {
  checkForValidToken(req, res, function (err, user) {
    console.log("came back")
    console.log(err)
    console.log(user)
    if (err) {
      console.log("erre in validation")
      return res.status(401).send({
        code: 401,
        message: "Failed to authenticate token."
      })
    }

    User.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    }, function (err, user) {
      if (err) return res.status(400).send({code:400,message:"There was a problem updating the user."});
      res.status(200).send(user);
    });

  });
});

//Logout user->remove accestoken from user obkject and save user object
router.delete('/logout/:id', function (req, res) {
  checkForValidToken(req, res, function (err, user) {

    if (err) return res.status(401).send({
      code: 401,
      message: "Failed to authenticate token."
    })

    if (!req.params.id) return res.status(500).send({
      code: 61,
      message: "Please provide user id"
    })
    User.findById(req.params.id, function (err, user) {
      if (err) return res.status(500).send("There was a problem in fetching user")
      if (!user) return res.status(203).send({
        code: 61,
        mesage: "User does not exists"
      })

      //remove acces token from user and save it in db 
      user.accessToken = '';
      user.save(function (err) {
        console.log(err)
      })
      res.status(200).send({
        code: 200,
        message: "User logged out succesfully"
      })

    })
  })


})

//forgot password->random generated string is sent to email
router.get('/forgot-password/:email', function (req, res) {
  var emailAddress = req.params.email;
  User.findOne({
    email: emailAddress
  }, function (err, user) {
    if (err) return res.status(500).send("error in fetching user details")
    if (!user) return res.status(404).send({
      code: 71,
      mesage: "Provided email id not present is server"
    })

    //generate random password (random string)
    var randomstring = Math.random().toString(36).slice(-6);
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: 'apps@boston-technology.com',
        pass: 'password789'
      }
    });
    var mailOptions = {
      from: 'apps@boston-technology.com',
      to: emailAddress,
      subject: 'Marketing App - Password Set/Change',
      html: '<p style="color:black">Hi ' + user.firstName + ' ,</p><br><p style="color:black">We just received a request to change the password for your account. Please use the auto-generated password provided below,</p><br>PASSWORD : ' + randomstring + '<br><br>Thanks'
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(404).send({
          code: 404,
          message: "Error in sending email"
        })
      } else {
        console.log('Email sent: ' + info.response);
        user.password = bcrypt.hashSync(randomstring);
        user.save(function (err, user) {
          res.status(200).send({
            code: 200,
            message: "Email sent successfully"
          })

        })
      }
    });
  })
})
//change password
router.put('/change-password', function (req, res) {
  console.log("in change password")

  oldPassword = req.body.oldPassword;
  newPassword = req.body.newPassword;
  userId = req.body.userId;
  if (!oldPassword) return res.status(400).send({
    code: 43,
    message: "Please provide old password"
  })
  if (!newPassword) return res.status(400).send({
    code: 43,
    message: "Please provide new password"
  })
  if (!userId) return res.status(400).send({
    code: 43,
    message: "Please provide user Id"
  })

  checkForValidToken(req, res, function (err, user) {
    console.log("came back from check validation in change password")
    console.log(err)
    if (err) return res.status(401).send({
      code: 401,
      message: "Failed to authenticate token."
    })

    if (oldPassword == newPassword) return res.status(400).send({
      code: 72,
      message: "Current password should not match with new password"
    })
    console.log(user.password)

    var verifyPassword = bcrypt.compareSync(req.body.oldPassword, user.password);
    if (!verifyPassword) return res.status(400).send({
      code: 73,
      message: "Old password provided is invalid"
    })

    user.password = bcrypt.hashSync(newPassword);
    user.save(function (err, user) {
      if (err) return res.status(404).send({
        code: 73,
        message: "Error in updating password"
      })
      res.status(200).send({
        code: 200,
        message: "Password updated successfully"
      })

    })
  })
})

function checkForValidToken(req, res, cb) {
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
module.exports = router;