var express = require('express')
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({
  extended: true,
}));
router.use(bodyParser.json());


var ProjectModel = require('../models/project');
var UserModel = require('../models/user');

var checkForValidToken = require('./util').checkForValidToken;
// function Rectangle() {
//   this.x = 0;
//   this.y = 0;
//   this.move = function (x, y) {
//     this.x = x;
//     this.y = y;
//     console.log("x " + x);
//     console.log("y " + y)
//   }
// }

router.post('/create-project', function (req, res) {
  console.log(req.body)
  var project = new ProjectModel({
    title: req.body.title,
    description: req.body.description,
    startDate: req.body.startDate,
    updatedDate: Date.now().toString(),
    projectStatus: req.body.projectStatus,
    projectType: req.body.projectType,
    serviceLiniked: req.body.serviceLiniked,
  });
  project.save(function (err, project) {
    if (err) {
      return res.status(400).send({
        code: 400,
        message: err.message,
      })
    }
    res.status(200).send({
      code: 200,
      message: "Project added succesfully",
    })
  })
})

router.post('/add-people-to-project', function (req, res) {
  // var re=new Rectangle();
  // re.move(10,9)
  var email = req.body.email;
  var projectId = req.body.projectId;

  if (!email) {
    return res.status(400).send({
      code: 400,
      message: "Please provide user email to be added",
    })
  }

  if (!projectId) {
    return res.status(400).send({
      code: 400,
      message: "Please provide project Id ",
    })
  }

  ProjectModel.findById(projectId, function (err, project) {
    if (err || !project) {
      res.status(400).send({
        code: 400,
        message: "Invalid project Id",
      })
    }

    UserModel.findOne({
      email: email,
    }, function (err, user) {
      if (err || !user) {
        return res.status(400).send({
          code: 400,
          message: "user with given email does not exist",
        })
      }
      for (var i = 0; i < project.people.length; i++) {
        console.log(project.people[i].userEmail)
        if (project.people[i].userEmail == email) {
          console.log("email already exist");
          return res.status(400).send({
            code: 400,
            message: "Given user already exist in the project"
          })
        }
      }

      project.people.push({
        userId: user._id,
        userName: user.firstName,
        userEmail: user.email,
      })
      project.save(function (err, project) {
        if (err) {
          return res.status(400).send({
            code: 400,
            message: "Error in adding people to project",
          })
        }
        res.status(200).send({
          code: 200,
          message: "people added successfully",
        })
      })
    })
  })
})


router.get('/all/:userId', function (req, res) {
  checkForValidToken(req, res, function (err, user) {
    if (err) {
      console.log("erre in validation")
      return res.status(401).send({
        code: 401,
        message: "Failed to authenticate token."
      })
    }
    var userId = req.params.userId;
    console.log("get all projects " + userId)

    ProjectModel.find({
      "people.userId": userId
    }, function (err, results) {
      console.log(err)
      if (err || results.length == 0) return res.status(400).send({
        code: 81,
        message: "No Projects Found"
      })
      var projectList = results;
      res.status(200).send({
        code: 200,
        project: projectList
      });

    })

    // lookup in mongodb

    // ProjectModel.aggregate([{
    //   $lookup: {
    //     from: 'users',
    //     localField: 'people._id',
    //     foreignField: '_id',
    //     as: 'users'
    //   }
    // }], function (err, res) {
    //   console.log(err)
    //   console.log(res)
    // })



    //match in monodb

    //  ProjectModel.aggregate(
    //     [
    //     {$match:{'title':'d'}},
    //  {$group:{_id:"$_id"}}
    //   ]
    //   ,function(err,res){
    //     console.log(err)
    //     console.log(JSON.stringify(res))
    //   })
  })
})
//check weather projectId  exist in the db and given userId is their inside that project
checkProject = function (projectId, userId, cb) {
  console.log("inside check project")
  if (!projectId) return cb(new Error("Please provide projectId"));
  if (!userId) return cb(new Error("Please provide userId"));
  ProjectModel.find({
    "_id": projectId,
    "people.userId": userId
  }, function (err, projects) {
    if (err || projects.length==0) return cb("Invalid project Id or user Id")

    return cb(null, projects)


  })
}
module.exports = router;
module.exports.checkProject = checkProject;