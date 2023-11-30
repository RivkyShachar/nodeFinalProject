const express= require("express");
const bcrypt = require("bcrypt");
const {auth, authAdmin} = require("../middlewares/auth");
const {UserModel,validUser, validLogin,createToken} = require("../models/userModel")
const router = express.Router();

// dont know why we need it not used
router.get("/" , async(req,res)=> {
  res.status(201).json({msg:"Users work"})
})

// get current user details
router.get("/myInfo",auth, async(req,res) => {
  try{
    let userInfo = await UserModel.findOne({_id:req.tokenData._id},{password:0});
    res.status(201).json(userInfo);
  }
  catch(err){
    res.status(500).json({msg:"err",err})
  }  
})

// get all users details - only admin allow
router.get("/usersList", authAdmin , async(req,res) => {
  try{
    let data = await UserModel.find({},{password:0});
    res.status(201).json(data)
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }  
})

// create new user
router.post("/", async(req,res) => {
  let validBody = validUser(req.body);

  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    user.password = "**********";
    res.status(201).json(user);
  }
  catch(err){
    if(err.code == 11000){
      return res.status(500).json({msg:"Email already in system, try log in",code:11000}) 
    }
    res.status(500).json({msg:"err",err})
  }
})

// create a token if the user is valid
router.post("/login", async(req,res) => {
  let validBody = validLogin(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let user = await UserModel.findOne({email:req.body.email})
    if(!user){
      return res.status(401).json({msg:"ERR: Wrong email"})
    }
    let authPassword = await bcrypt.compare(req.body.password,user.password);
    if(!authPassword){
      return res.status(401).json({msg:"ERR: Wrong password"});
    }
    // create token and return it
    let token = createToken(user._id,user.role);
    res.status(201).json({token});
  }
  catch(err){
    console.log(err)
    res.status(500).json({msg:"err",err})
  }
})

router.put("/changePassword", auth, async(req,res) =>{
    // not sure if good
    // only the user itself can change his password
    // need to validate the token
    // get a password and make sure the password is correct
    // if not throw
    // if correct hash the new password and save it
})

router.delete("/:idDel", auth, async(req, res)=>{
    // do delete
})

module.exports = router;