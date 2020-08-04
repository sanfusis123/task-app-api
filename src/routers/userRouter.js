const express = require('express');
const User = require('../models/users');
const auth = require('../middleware/auth');
const adminauth = require('../middleware/adminauth');
const multer = require('multer');
const {sendWelcomeEmail , sendByeEmail, sendOtpEmail } = require('../email/account');
const router = express.Router();

const otp =  ()=>{
    const num = Math.round(Math.random()*1000000);
    return num;
 };
 

router.post('/users', async (req , res)=>{
    const user = new User(req.body);
    user.otp = otp();
    try{

     await user.save();
     sendWelcomeEmail(user.email , user.name);
     sendOtpEmail(user.email ,user.name , user.otp);
     res.status(200).send({mssg: 'varify Your Email' ,user});
    } catch(e){
     res.send(e).status(500);  
   }
    
});


router.post('/users/varify/:email', async(req, res)=>{
        try{
         const user = await User.findOne({email: req.params.email});
         if(!user){
            return   res(404).send('Wrong Credential');
           }
         if(user.varified){
             return res.status(400).send('you ar alrady varified go ahead log in');
         }  
        if(!req.body.otp){
             return res.status(400).send('worng Field')
         }
         const value =   parseInt(req.body.otp) === user.otp;
         if(!value ){
            return   res.status(404).send('Incorrect Otp');
         }
         user.otp = undefined;
         user.varified = true;
         const token = await user.genrateAuthToken();
         res.send({user ,token, mssg: 'You have successFully varified'}); 

        }catch(e){
            res.status(500).send(e);
        }
})

router.post('/users/login', async(req, res)=>{
       try{
           const user = await User.findByCredentials(req.body.email, req.body.password);
           if(!user.varified === true){
               return res.status(500).send({error: 'varify Your Email id'});
           }
           const token = await user.genrateAuthToken();
           res.send({user, token});
       }catch(e){
           res.status(500).send(e);
       }
})

router.post('/users/logout', auth , async(req, res)=>{
  try{
     req.user.tokens = req.user.tokens.filter((token)=>{
         return token.token !== req.token
     });
     await req.user.save();
     res.send('You had been Logged out');
  }catch(e){

    res.status(500).send(e);
  }

});

router.post('/uesrs/logoutAll' , auth , async(req  , res )=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send('all session is logged out');
    }catch(e){
        res.status(500).send(e);
    }
})


router.get('/users/me', auth , async(req, res)=>{
    res.send(req.user);

});

router.patch('/users/me', auth ,async(req,  res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdate = ['name', 'age', 'email', 'town', 'password'];
    const isValide = updates.every((update)=> allowedUpdate.includes(update));
    
    if(!isValide){
        return res.status(404).send('You have not such field for Update');
    }
    try{
    updates.forEach((update)=> req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
    } catch(e){
        res.status(500).send(e);
    }

});

router.delete('/users/me',auth , async(req , res)=>{
 try{ 
    await  req.user.remove(); 
  sendByeEmail(req.user.email , req.user.name);
     const mssg = {
         massg: 'User is deleted',
         user : req.user
     }
     res.send(mssg);
 }catch(e){
     res.status(500).send(e);
 }
});

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
       if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
             return cb(new Error('file is must be jpg or jpeg or png or gif'));
       }
             cb(undefined, true);
    }
    
});
router.post('/users/me/avatar', auth , upload.single('avatar') , async(req,res)=>{
    req.user.avatar = req.file.buffer;
    await req.user.save();      
    res.send('file uploaded');
}, (error, req,res,next)=>{
       res.status(400).send({error : error.message});
});

router.get('/users/:id/avatar',  async(req, res)=>{
   try{ 
    const user = await User.findById(req.params.id);   
    res.set('Content-Type', 'image/jpg');
    res.send(user.avatar);
   }catch(e){
       res.status(404).send(e);
   }
})

router.delete('/users/me/avatar', auth , async(req, res)=>{
  try{  req.user.avatar = undefined;
    await req.user.save();
    res.send({mssg: 'file deleted'})
  }catch(e){
      res.status(500).send(e);
  }

})

module.exports = router;
