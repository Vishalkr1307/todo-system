const express = require('express');
const router= express.Router();
const Product=require("..//module/product")
const {validationResult}=require("express-validator")
const {titleChain,descriptionChain,taskstatusChain,formatOfError}=require("..//util/valdation")


router.post("/addTask",titleChain(),descriptionChain(),taskstatusChain(),async (req, res) => {
    try{
        const error=validationResult(req)
        if(!error.isEmpty()){
            return res.status(400).send(formatOfError(error.array()).join(","))
        }

        const product=await Product.create(req.body)
        return res.status(200).send(product)

    }
    catch(err){
        
        return res.status(404).send("bad request");
    }
})

router.get("/getTask",async (req,res)=>{
    try{
        const product=await Product.find().populate({path:"createdBy",select:{email:1}}).lean().exec()
        return res.status(200).send(product)

    }
    catch(err){
        return res.status(404).send("bad request");
    }
})
router.get("/getTask/:id",async (req,res)=>{
    try{
        const product=await Product.findById(req.params.id).populate({path:"createdBy",select:{email:1}}).lean().exec()
        return res.status(200).send(product)

    }
    catch(err){
        return res.status(404).send("bad request");
    }
})
router.put("/updateTask/:id",async (req,res)=>{
    try{
        const product=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true});
        return res.status(200).send(product)

    }
    catch(err){
        return res.status(404).send("bad request");
    }
})
router.patch("/updateTask/:id",async (req,res)=>{
    try{
        const product=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true});
        return res.status(200).send(product)

    }
    catch(err){
        return res.status(404).send("bad request");
    }
})
router.delete("/deleteTask/:id",async (req,res)=>{
    try{
        const product=await Product.findByIdAndDelete(req.params.id);
        return res.status(200).send(product)

    }
    catch(err){
        return res.status(404).send("bad request");
    }
})

module.exports =router;