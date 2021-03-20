/* eslint-disable no-plusplus */
/* eslint-disable array-callback-return */
/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

const contactController = {};
const nodemailer = require('nodemailer');
const Contact = require('../database/models/Contact');

contactController.getInfo = async(req, res) => {
  try{
    const { fullName, affair, email, message, ip } = req.body;
    const searchIp = await Contact.findOne({ip});
    const searchMessage = await Contact.findOne({message});

      if(email.includes('.') && email.includes('@')){ 
        if(message.length > 124){
          if(!message.includes(' ')){ 
            res.status(411).json({
              message: 'Your message was considered spam'
          });
        } else if (searchIp){
            res.status(411).json({
              message: `Your ip was send some messages, please don't send more of 1 time per week`
            });
                } else if(searchMessage){
                    res.status(411).json({
                      message: 'This message was sent to before'
                    });
                } else {
                    const arr = [];
                    const double = [];
                    const messageArray = message.toLowerCase().split(' ');
                    const range = message.length / 100 * 8;
                    const repeated = {};
                    
                    // Repeated words
                    messageArray.filter((c, index) => {
                      double.push(messageArray.indexOf(c) !== index);
                    });

                    double.forEach((number)=> {
                      repeated[number] = (repeated[number] || 0) + 1;
                    });
                    

                    // Validation spam
                    for(let i = 0; i <= messageArray.length; i++){
                      if(messageArray[i] === messageArray[i + 1] && messageArray[i] === messageArray[i - 1]){
                        arr.push('');
                      } else if(messageArray[i] === messageArray[i + 2] && messageArray[i] === messageArray[i - 2]){
                          arr.push('')
                      } else if(repeated.true > range){ 
                            arr.push('')
                      }
                    }
                      if(arr.length === 0){
                        // Save data
                        const contact = new Contact(req.body);
                        contact.save();

                          // If the message not is detected like spam the email will send
                          async function sendEmail(){
                            const transporter = nodemailer.createTransport({
                              service: 'gmail',
                                auth: {
                                  user: process.env.EMAIL,
                                  pass: process.env.PASSWORD
                                }
                            });

                              const mailOptions = {
                                from: `${fullName}`,
                                to: `codevstest@gmail.com`,
                                subject: `${affair}`,
                                html: `
                                <h1 style=
                                'text-align:center;
                                color: #00aae4;
                                font-size:30px;'>
                                Asunto:  ${affair}
                                </h1> 
                                <h2 style=
                                'text-align:center;
                                color: #252850;'>
                                Nombre remintente: <strong>${fullName}</strong>, ${email}
                                </h2>
                                <p style=
                                'text-align:center;
                                font-family: sans-serif;
                                font-size:16px'>
                                ${message}
                                </p>`
                              };

                                transporter.sendMail(mailOptions, (error)=> {
                                  if (error){
                                    console.log(error);
                                  } else {
                                    console.log('Email sent');
                                    res.status(200).json(req.body);
                                  }
                                });
                          }
                            
                            sendEmail();

                            res.status(200).json({
                              message: 'Success'
                            });      
            
                              } else { // If is detected like spam send status 411
                                  res.status(411).json({
                                    message: 'Your message was considered spam'
                                  });
                                }
    
                        
                  }
                    }else {  // The message need more characters
                      res.status(411).json({
                        message: 'The message need 125 characters or more'
                      });
                    }
      } else { // The mail not is valid
          res.status(411).json({
            message: 'Invalid email'
          });
        }

  } catch(error){
    console.error(error);
    res.status(500).json({
        message: 'Internal Server Error, Try again.',
    });
    }
}


module.exports = contactController;