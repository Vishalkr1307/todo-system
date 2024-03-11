const mongoose=require("mongoose")
const productSchema=new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    tasks_status:{type:String, required:true},
    tags:[{type:String, required:true}],
    subTasks:[{subTasksTitle:{type:String, required:true},status:{type:Boolean, default:false}}],
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true}

},{
    versionKey:false,
    timestamps:true,
})

module.exports =mongoose.model("task",productSchema)