const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  mongoose = require('mongoose'),
  config = require('./config/main');


// Database Connection
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("db is connected")
  // console.log(db.collections.projects.getIndexes().then(index=>
  // console.log(index)))
  // db.collections.projects.dropIndexes().then({

  // })

});

// Start the server
const server = app.listen(config.port);
console.log('Your server is running on port ' + config.port + '.');


// Log requests to API using morgan
app.use(logger('dev'));

//body parser is to handel body of post request
// app.use(bodyParser.urlencoded({ extended: false }));  
// app.use(bodyParser.json())

// Enable CORS from client-side
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


//controllers
userController = require('./controllers/userController')
app.use('/users', userController)


projectController = require('./controllers/projectController')
app.use('/project', projectController)


milestoneController = require('./controllers/milestoneController')
app.use('/milestone', milestoneController)

//user entity
// const User=require('./models/user')

// var user=new User({email:'fir@gmail.com'})
// console.log(user.email)
// user.speak(function(err,user){
//     if(err) return console.error("error in speak method")
// console.log(user)
// });