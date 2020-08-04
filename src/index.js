require('./db/mongoose');
const express = require('express');
const userRouter = require('../src/routers/userRouter');
const taskRouter = require('../src/routers/taskRouter');
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
app.get('/', (req , res)=>{
    res.send('app deployed');
})
app.listen(port, ()=>{
    console.log('server is running at ', port);
});

