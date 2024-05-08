const nodeMailer = require("nodemailer");
require("dotenv").config();

const sendEmail  = async(options)=>{
const tranporter = nodeMailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    service:process.env.SMTP_SERVICE,
    auth:{
        user:process.env.SMTP_MAIL,
        pass:process.env.SMTP_PASSWORD,
    },
});

const mailOptions = {
    from:process.env.SMTP_MAIL,
    to:options.email,
    subject:options.subject,
    text:options.message,
};

await tranporter.sendMail(mailOptions);

};
module.exports = sendEmail;
