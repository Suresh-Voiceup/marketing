module.exports = {  
     // Secret key for JWT signing and encryption
  'secret': 'supersecret',
  // Database connection information
  'database': 'mongodb://localhost:27017/mydb',
  //port or running application
'port': process.env.PORT || 3000  
}