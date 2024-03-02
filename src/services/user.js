import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import ServiceError from '../errors/errors.js';
import UserModel from '../models/user.js';

const secretKey = process.env.SECRET_KEY;

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

async function CreateUser(data) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(data.password, salt);

        const result = await UserModel.create({
            username: data.username,
            email:  data.email,
            password:  hashed,
            firstName:  data.firstName,
            lastName:  data.lastName,
            age:  data.age,
            country:  data.country,
            gender:  data.gender,
        });

        emailTransporter.sendMail({
            from: 'Portfolio Platform',
            to: result.email, 
            subject: 'Welcome to Our Platform!',
            html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f5f5f5;
                                margin: 0;
                                padding: 0;
                            }
                            .container {
                                width: 80%;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #333333;
                                border-radius: 5px;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                color: #fbffe3;
                            }
                            ul {
                                list-style-type: none;
                                padding: 0;
                            }
                            li {
                                margin-bottom: 5px;
                            }
                        </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Welcome to Our Platform!</h1>
                        <p>Dear ${result.firstName} ${result.lastName},</p>
                        <p>We are thrilled to have you as a member of our community.</p>
                        <p>Your account details:</p>
                        <ul>
                            <li>Username: ${result.username}</li>
                            <li>Email: ${result.email}</li>
                            <li>Age: ${result.age}</li>
                            <li>Country: ${result.country}</li>
                            <li>Gender: ${result.gender}</li>
                        </ul>
                        <p>Thank you for joining us!</p>
                    </div>
                </body>
            </html>
        `});

        return {
            id: result._id,
            username: result.username,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            age: result.age,
            country: result.country,
            gender: result.gender,
        };
    } catch (e) {
        if (e.name === 'ValidationError') {
            throw new ServiceError('validation error: ' + e.message, 400);
        } else if (e.name === 'MongoServerError' && e.code === 11000) {
            throw new ServiceError('duplicate key error: this email or username is already registered.', 400);
        } else {
            console.error('[!] create user:', e.message);
            throw new Error('something went wrong... please try again later :)');
        }
    }
};

async function GenerateToken(email, pw) {
    try {
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            throw new ServiceError('invalid credentials', 401);
        }
    
        const isValid = await bcrypt.compare(pw, user.password);
    
        if (!isValid) {
            throw new ServiceError('invalid credentials', 401);
        }
    
        const token =  jwt.sign({
            userID: user._id,
            isAdmin: user.role === "admin",
        }, secretKey, { expiresIn: '12h' });
    
        return token;
    } catch (e) {
        if (e.name === 'ServiceError') {
            throw e;
        }

        console.error('[!] generate token: ', e.message);
        throw new Error('something went wrong... try again later :)');
    }
};

async function ParseToken(token) {
    try {
        const decodedData = jwt.verify(token, secretKey);

        const userID = decodedData.userID;
        const isAdmin = decodedData.isAdmin;

        return {
            userID: userID,
            isAdmin: isAdmin,
        };
    } catch (e) {
        console.error('[!] parse token:', e.message);
        throw new Error('something went wrong... try again later :)');
    }
};

export {
    CreateUser,
    GenerateToken,
    ParseToken,
};
