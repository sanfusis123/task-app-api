require('../db/mongoose');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

const auth = async(req, res, next)=>{
  try{
    const token = req.header('authorization').replace('Bearer ', '');
    const decode = jwt.verify(token , process.env.SECRET_KEY);
    const user = await User.findOne({_id : decode._id, 'tokens.token': token});
    if(!user){
        throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
}catch(e){
    res.status(401).send('Authorization is required');
}
}
module.exports = auth;