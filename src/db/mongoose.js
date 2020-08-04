const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, 
useUnifiedTopology: true ,
useFindAndModify: false,
useCreateIndex:true}, (error , result)=>{
    if(error){
     return    console.log('Error! db is not connected');
    }
    console.log('db is connected');
});
