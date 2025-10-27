require('dotenv').config()
const bcrypt=require('bcryptjs')
var jwt=require('jsonwebtoken')
const User=require('../model/usermodel')

exports.createuser=async (req,res)=>{
    try{
        const {firstname,lastname,email,username,password,usertype}= req.body
console.log("Received body:", req.body);
        const hashedpassword=await bcrypt.hash(password,10)
const newUser=new User({
    firstname,lastname,email,username,password:hashedpassword,usertype
})
    await newUser.save()
     console.log("User created:", newUser);
    res.status(200).json({message:"user registered successfully",user:newUser})
    }
    catch(err){
        console.error("Registration error:", err)
        res.status(500).json({message:err.message})
    }
}


exports.loginUser=async (req,res)=>{
    try{
        const {email,username,password}=req.body
        const user= await User.findOne({email})
        if(!user)
        {return res.status(400).json({message:'user Not Found'})}
        const ismatch=await bcrypt.compare(password,user.password)
        if(!ismatch)
        {return res.status(400).json({message:"Invalid Password"})}
        const token=jwt.sign({
            id:user._id,username:user.username,
            email:user.email,
            usertype:user.usertype},process.env.secretekey)

            const safeuser={
                id:user._id,
                username:user.username,
                email:user.email,
                usertype:user.usertype
            }
            res.cookie("token",token)
            console.log("...........",token)
            return res.status(200).json({message:"Login successful",token,user:safeuser})

    } catch(err){
        res.status(500).json({message:err.message})
    }
}

exports.getprofile=(req,res)=>{
    if(!req.user){
        return res.status(401).json({message:"Not authenticated"})
    }
    const {id,username,email,usertype}=req.user
    return res.status(200).json({message:"success",
        User:{id,username,email,usertype}
    })
}

exports.admindashboard=(req,res)=>{
    res.json({message:`welcome admin,${req.user.username}`})

}
exports.commondashboard=(req,res)=>{
    res.json({message:`welcome ,${req.user.username}...${req.user.usertype}`})

}

exports.studentdashboard=(req,res)=>{
    res.json({message:`welcome student,${req.user.username}...${req.user.usertype}`})
}

exports.logoutuser=(req,res)=>{
    res.clearCookie("token")
    console.log(res.cookie.token)
    res.status(200).json({message:`Logout successfull`})
}