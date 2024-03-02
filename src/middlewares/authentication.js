import { ParseToken } from '../services/user.js';

async function JWTAuthentication(req, res, next) {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                err: 'Token not provided'
            });
        }

        const { userID, isAdmin } = await ParseToken(token);

        req.userID = userID;
        req.isAdmin = isAdmin;

        next();
    } catch (e) {
        console.error('[!] jwt authentication:', e.message);
        res.status(500).json('something went wrong... please try again later :)');
    }
};

export default JWTAuthentication;