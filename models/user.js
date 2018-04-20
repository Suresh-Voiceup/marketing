const mongoose = require('mongoose'),  
      Schema = mongoose.Schema,
      bcrypt = require('bcrypt-nodejs');

const UserSchema=new Schema({
  email: String,
  password: String,
  firstName:String,
  lastName:String,
  phoneNumber:String,
  company:String,
  dob:String,
  gender:String,
  country:String,
  deactivated:Boolean,
  createdByAdmin:Boolean,
  accessToken:String
});


UserSchema.methods.speak=function(done){
  
    var user=this;
    if(!user.email) return done( new Error("no user found"));
    return done(null,user)
    console.log("inside userscheme speak method")
    console.log(user.email)
}
module.exports=mongoose.model('user',UserSchema)