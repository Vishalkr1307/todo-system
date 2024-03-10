const express=require("express")
const router=express.Router()
const User=require("..//module/user")
const {body,validationResult}=require("express-validator")
const nameChain=()=>body("name").notEmpty().withMessage("Name is required").isString()
const emailChain=()=>body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("it must be email").custom(async(val)=>{
    const user=await User.findOne({email:val}).lean().exec()
    if(user){
        throw new Error("Email is already in use")
    }
})
const loginEmailChain=()=>body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("it must be email").custom(async(val)=>{
    const user=await User.findOne({email:val}).lean().exec()
    if(!user){
        throw new Error("User not found")
    }
})
const passwordChain=()=>body("password").notEmpty().isLength({min:5}).withMessage("password must be at least 5 characters")
    
const formatOfError=require("../util/valdation")


router.post("/register",nameChain(),emailChain(),passwordChain(),async (req,res)=>{
    try{

        const error=validationResult(req)
        if(!error.isEmpty()){
            return res.status(400).send(formatOfError(error.array()).join(","))

        }
        const user=await User.create(req.body)
        return res.status(200).send(user)

    }
    catch(err){
        return res.status(400).send("Bad request")
    }

})

router.post("/login",loginEmailChain(),passwordChain(),async (req,res)=>{
    try{
        const error=validationResult(req)
        if(!error.isEmpty()){
            return res.status(400).send(formatOfError(error.array()).join(","))
        }


    }
    catch(err){
        return res.status(400).send("Bad request")
    }
})
module.exports=router