const mongoose=require("mongoose")
const bcrypt=require("bcrypt")

const userSchema=new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    profile_pic:{type:String},
    verifya:{type:Boolean,default:false}
},{
    versionKey:false,
    timestamps:true,
})
userSchema.pre("save",function(next){
    if(!this.isModified("password")) next()
    this.password=bcrypt.hashSync(this.password,8)
     next()

})
userSchema.methods.checkPassword=function(password){
    return bcrypt.compare(this.password,password)
}
module.exports=mongoose.model("user",userSchema)