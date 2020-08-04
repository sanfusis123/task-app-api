const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const Task =require('./tasks');



const userSchema =  new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true
    },
    age:{
        type: Number, 
        default: 0,
        validate(value){
            if(value <0){
                throw new Error('Age must not be -ve number');
            }
        }
    },
    town:{
        type: String
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid');
            }
        }
    },
    password:{
        type: String,
        trim: true,
        required: true,
        validate(value){
              if(value.length < 7){
                  throw new Error('Password must be 8 or greather character');
              }
              if(value.includes('password')){
                  throw new Error('Password is not contains');
              }
        }
    },
    otp: {
        type: Number,
        default:0
    },
    varified: {
        type: Boolean,
        default:false
    },
    avatar: {
        type: Buffer
    },
    tokens:[{
        token:{
          type: String,
          required: true        }
    }]
}, {
    timestamps: true
});

// user public data

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    delete userObject.otp;
    return userObject;
}

userSchema.virtual('tasks', {
    ref : 'task',
    localField: '_id',
    foreignField:'owner'
})

// token method 

userSchema.methods.genrateAuthToken = async function(){
    const user  = this;
    const token = await jwt.sign({_id : user._id.toString()}, process.env.SECRET_KEY);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}


// login Findcredentials 

userSchema.statics.findByCredentials = async(email , password)=>{
    const user = await User.findOne({email});
    if(!user){
        throw new Error('invalid login');
    }
    const isMatch = await bcrypt.compare(password , user.password);
    if(!isMatch){
        throw new Error('Invalid LogIn');
    }
    return user
}


// hashing plain password 
userSchema.pre('save' , async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password , 8);
    }
        next();
});

// removing task before deleting the user 
userSchema.pre('remove' , async function(next){
    const user = this;
    await Task.deleteMany({owner : user._id});
    next(); 
})

const User = mongoose.model('Users' , userSchema);

module.exports = User;