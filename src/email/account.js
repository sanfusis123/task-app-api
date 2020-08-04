const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email , name)=>{
  try{ 
    sgMail.send({
        from:'sanfrostjr@gmail.com',
        to: email,
        subject: 'Welcome to the our website thanks for your Joining',
        text:`Welcome!  ${name} to the our web app her you have find all solution of the web app`
    });
} catch(e){
      throw new Error('Email is not send')    
 }
}

const sendOtpEmail = (email , name, otp)=>{
    try{ 
      sgMail.send({
          from:'sanfrostjr@gmail.com',
          to: email,
          subject: 'Varify Your Account',
          text:`Welcome!  ${name} to the our web app . Your otp is ${otp}`
      });
  } catch(e){
        throw new Error('Email is not send')    
   }
  }

const sendByeEmail = (email , name )=>{
    try{
        sgMail.send({
            from: 'danforstjr@gmail.com',
            to:email,
            subject: 'You have to Delete Your Account',
            text: `Good Bye! , ${name} , You have happy to go on` 
        })
    } catch(e){
        throw new Error('Email is not send')    
   }
}

module.exports = {sendWelcomeEmail , sendOtpEmail , sendByeEmail}