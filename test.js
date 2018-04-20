var http = require('http');
var expres=require('express');
var app=expres();
var bodyParser=require('body-parser')
var mongoos=require('mongoose')
app.use(bodyParser.json);
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: false }))


app.get('/',function(req,res){
res.sendFile('index.html');
});
app.get('/s',function(req,res){
res.sendFile('index.html');
});
app.post('/submit-student-data',function(req,res){
  console.log(req.body)
  res.send("post")
})
app.listen(5000,function(){
  console.log("Node server is running at 5000")
})


// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/mydb1";
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//     db.collection('Persons', function (err, collection) {
//         if(err) throw err;
//         collection.insert({ id: 1, firstName: 'Steve', lastName: 'Jobs' });
//         collection.insert({ id: 2, firstName: 'Bill', lastName: 'Gates' });
//         collection.insert({ id: 3, firstName: 'James', lastName: 'Bond' });
        
        

//         db.collection('Persons').count(function (err, count) {
//             if (err) throw err;
            
//             console.log('Total Rows: ' + count);
//         });
//     });
// });

// http.createServer(function (req, res) {
//     console.log(req.body)
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write('<html><body><p>hii</p></body></html>')
//     res.end("dd");
//
// }).listen(8080);