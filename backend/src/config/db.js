const mongoose=require("mongoose")
require("dotenv").config()
module.exports=()=>{
    return mongoose.connect(process.env.db).then(()=>console.log("Connected to database")).catch((err)=>console.log("Couldn't connect to database"))
}