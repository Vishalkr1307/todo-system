const express=require("express")
const app= express()
const User=require("./moduleController/userController")
const Product=require("./moduleController/productControl")
const session= require("express-session")
app.use(express.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
app.use("/auth",User)
app.use("/task",Product)



module.exports =app