const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,                  
    secure: true,   
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendEmail(req, res){

    try {

        const {to, subject, text} = req.body;

        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject,
            text
        }

        const response = await transporter.sendMail(mailOptions);

        return res.status(200).json(response);

    }catch(error){

        return res.status(400).json(error.message);

    }
}

module.exports = {sendEmail};