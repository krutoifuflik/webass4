import express from 'express';

import { CreateUser, GenerateToken  } from '../services/user.js';

const authController  = express.Router();

authController.post('/sign-up', async (req, res) => {
    try {
        const requiredFields = ['username', 'email', 'password', 'firstName', 'lastName', 'age', 'country', 'gender'];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ err: `missing required field: '${field}'` });
            }
        }

        const data = req.body;
        const user = await CreateUser(data);

        return res.status(201).json(user);
    } catch (e) {
        if (e.name === 'ServiceError') {
            res.status(e.code).json({
                err: e.message
            });
        } else {
            res.status(500).json({
                err: e.message,
            });
        }
    }
});

authController.post('/sign-in', async (req, res) => {
    try {
        const requiredFields = ['email', 'password'];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ err: `missing required field: '${field}'` });
            }
        }

        const { email, password } = req.body;

        const token = await GenerateToken(email, password);

        return res.status(200).json({ token });
    } catch (e) {
        if (e.name === 'ServiceError') {
            res.status(e.code).json({
                err: e.message
            });
        } else {
            res.status(500).json({
                err: e.message,
            });
        }
    }
});

export default authController;