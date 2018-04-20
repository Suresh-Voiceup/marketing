var router = require('express').Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({
    extended: true
}))
var Milestone = require('../models/milestone')
var ProjectController = require('./projectController');

router.post('/', function (req, res) {
    checkProject();

    var milestone = new Milestone({
        title: req.body.title,
        description: req.body.description,
        projectId: req.body.projectId

    });
    milestone.save(function (err, milestone) {

        if (err || !milestone) return res.status(400).send({
            code: 400,
            message: "error in adding milestome"
        })

        res.status(200).send({
            code: 200,
            message: "milestone added successfully"
        })
    })
    console.log(milestone)
})


router.get('/:userId/:projectId', function (req, res) {
    var userId = req.params.userId;
    var projectId = req.params.projectId;
    if (!userId) {
        return res.status(400).send({
            code: 400,
            message: "Please provide userId",
        })
    }
    if (!projectId) {
        return res.status(400).send({
            code: 400,
            message: "Please provide projectId",
        })
    }
    ProjectController.checkProject(projectId, userId, function (err, project) {
        if (err) return res.status(400).send({
            code: 80,
            message: "Invalid project Id or User Id "
        })

        Milestone.find({
            "projectId": projectId
        }, function (err, milestones) {

            console.log(err)
            console.log(milestones)
        })
    })


})
module.exports = router;