/** https://nodemailer.com/smtp/ */

const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
let aws = require('@aws-sdk/client-ses');
let { defaultProvider } = require('@aws-sdk/credential-provider-node');

const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'eu-central-1',
  defaultProvider,
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

module.exports.getTemplate = (filename, body = {}) => {
  const emailTemplatePath = path.join(__dirname, '../', 'email-templates', filename);
  const template = fs.readFileSync(emailTemplatePath, { encoding: 'utf-8' });
  return ejs.render(template, body);
};

module.exports.send = async (email, subject, template) => {
  try {
    const options = {
      from: process.env.SMTP_FROM, // sender address
      to: email, // list of receivers
      subject: subject || 'Subject', // Subject line
      html: template, // html body
      ses: {
        // optional extra arguments for SendRawEmail
        Tags: [
          {
            Name: 'tag_name',
            Value: 'tag_value',
          },
        ],
      },
    };
    await transporter.sendMail(options);
  } catch (error) {
    console.error(error);
  }
};
