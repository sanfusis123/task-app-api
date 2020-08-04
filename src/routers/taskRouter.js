const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const Task = require('../models/tasks');
const User = require('../models/users.js');




router.post('/task', auth ,  async(req, res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
      await  task.save();
    const   mssg ={
        massg: 'Task is created',
        task
               }
        res.status(201).send(mssg);       
    } catch(e){
        res.status(500).send(e);
    }

});

// adding queryString
router.get('/task', auth , async(req, res)=>{
    const match = {} ;
    const sort = {};
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }  
    try{
            const user = req.user;
            await user.populate({
                path: 'tasks',
                match,
                options:{
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort
                }
            }).execPopulate();
            res.send(user.tasks);
    
    }catch(e){
        res.status(500).send(e);
    }

});

router.get('/task/:id',auth , async(req, res)=>{
    const _id = req.params.id;
     
     try{
         const task = await Task.findOne({_id , owner: req.user._id });
         if(!task){
             return res.status(400).send('No Such Task is found');
         }
         res.send(task);
     } catch(e){
         res.status(500).send(e);
     }
});

router.patch('/task/:id',auth , async(req,res)=>{
      const updates = Object.keys(req.body);
      const allowUpdates = ['description', 'completed'];
      const isvalid = updates.every((update)=> allowUpdates.includes(update));
       if(!isvalid){
           return res.status(404).send('Invalid Updates!');
       }
       try{
        const task = await Task.findOne({_id :req.params.id , owner : req.user._id});
        if(!task){
               return res.status(400).send('No such request is availiable');
        }
        updates.forEach((update)=> task[update] = req.body[update] );
        await task.save();
        const mssg = {
            massg : 'Your request updated',
            task
        };
        res.send(mssg);

    }catch(e){
           res.status(500).send(e);
       }
      
});

router.delete('/task/:id',auth , async(req, res)=>{
    try{
         const task =  await Task.findOne({ _id :req.params.id , owner:req.user._id});
         if(!task){
            return  res.status(404).send('No such task is Availiable');
        }
        await task.remove();
        const mssg ={
            massg: 'Task is deleted',
            task
        }
        res.send(mssg);
    }catch(e){
        res.status(500).send(e);
    }
});

module.exports = router;
