const express=require("express")
const app= express()
const User=require("./moduleController/userController")
app.use(express.json())
app.use("/auth",User)



module.exports =app