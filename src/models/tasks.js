const mongoose = require('mongoose');
const validator = require('validator');

const task = new mongoose.Schema({
    description:{
        type: String,
        required: true,
        trim: true,
    },
   completed:{
       type: Boolean,
       default: false
   },
   owner:{
       type: mongoose.Schema.Types.ObjectId,
       required: true,
       ref: 'Users'
   }   
},{
    timestamps: true
});



const Task = mongoose.model('task', task);
module.exports = Task;