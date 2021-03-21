/* eslint-disable no-plusplus */
/* eslint-disable array-callback-return */

const nodemailer = require('nodemailer');

const Contact = require('../database/models/Contact');

const contactController = {};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

contactController.getInfo = async (req, res) => {
  try {
    const { fullName, subject, email, message, ip } = req.body;
    const searchIp = await Contact.findOne({ ip });
    const searchMessage = await Contact.findOne({ message });

    if (!fullName || !subject || !email || !message || !ip) {
      return res.status(400).json({
        message: 'Please fill every data',
      });
    }
    if (email.includes('.') && email.includes('@')) {
      if (fullName.length > 3) {
        if (message.length > 124) {
          if (!message.includes(' ')) {
            return res.status(406).json({
              message: 'Your message was considered spam',
            });
          }
          if (searchIp) {
            return res.status(406).json({
              message: `Your ip was send some messages, please don't send more of 1 time per week`,
            });
          }
          if (searchMessage) {
            return res.status(406).json({
              message: 'This message was sent to before',
            });
          }
          const arr = [];
          const double = [];
          const messageArray = message.toLowerCase().split(' ');
          const range = (message.length / 100) * 8;
          const repeated = {};

          // Repeated words
          messageArray.filter((c, index) => {
            double.push(messageArray.indexOf(c) !== index);
          });

          double.forEach((number) => {
            repeated[number] = (repeated[number] || 0) + 1;
          });

          // Validation spam
          for (let i = 0; i <= messageArray.length; i++) {
            if (
              messageArray[i] === messageArray[i + 1] &&
              messageArray[i] === messageArray[i - 1]
            ) {
              arr.push('');
            } else if (
              messageArray[i] === messageArray[i + 2] &&
              messageArray[i] === messageArray[i - 2]
            ) {
              arr.push('');
            } else if (repeated.true > range) {
              arr.push('');
            }
          }
          if (arr.length === 0) {
            // Save data
            const contact = new Contact(req.body);
            contact.save();

            // If the message not is detected like spam the email will send

            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
              },
            });

            const mailOptions = {
              from: `${fullName}`,
              to: process.env.EMAIL,
              subject: `${subject}`,
              html: `
                                      <h1 style=
                                      'text-align:center;
                                      color: #00aae4;
                                      font-size:30px;'>
                                      Asunto:  ${subject}
                                      </h1> 
                                      <h2 style=
                                      'text-align:center;
                                      color: #252850;'>
                                      Name sender: <strong>${fullName}</strong>, ${email}
                                      </h2>
                                      <p style=
                                      'text-align:center;
                                      font-family: sans-serif;
                                      font-size:16px'>
                                      ${message}
                                      </p>`,
            };

            transporter.sendMail(mailOptions, (error) => {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent');
                return res.status(200).json(req.body);
              }
            });

            return res.status(200).json({
              message: 'Success',
            });
          }
          // If is detected like spam send status 406
          return res.status(406).json({
            message: 'Your message was considered spam',
          });
        }
        // The message need more characters
        return res.status(411).json({
          message: 'The message need 125 characters or more',
        });
      }
      // The name is too short
      return res.status(411).json({
        message: 'Your name need 4 characters or more',
      });
    }
    // The mail not is valid
    return res.status(406).json({
      message: 'Invalid email',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

module.exports = contactController;
