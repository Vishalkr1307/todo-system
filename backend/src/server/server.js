const app=require("..//index")
const connect=require("..//config/db")
require("dotenv").config()
const port=process.env.PORT ||8000

app.listen(port,async (req,res)=>{
    await connect()
    console.log(`Connect to ${port}`)
})
