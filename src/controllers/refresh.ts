import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || `default_refresh_token_secret`;

// Middleware to parse JSON request bodies
app.use(express.json());

async function refresh(req: Request, res: Response) {
    if (req.body.jwt) {
        const refreshToken = req.body.jwt;

        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        if (!refreshTokenSecret) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        jwt.verify(refreshToken, refreshTokenSecret,
            (err: jwt.VerifyErrors | null, decoded: any) => {
                //console.log(err);
                console.log(decoded.id);
                console.log(decoded.role);
                if (err) {
                    
                    return res.status(406).json({ message: 'Unauthorized' });
                }
                else {
                    const accessToken = jwt.sign({
                        id: decoded.id,
                        role: decoded.role
                    }, process.env.SECRET_KEY || 'default_access_token_secret', {
                        expiresIn: '1h'
                    });
                    return res.json({ accessToken });
                }
            })
    } else {
        //console.log('no cookie');
        return res.status(406).json({ message: 'Unauthorized' });
    }
}

export default refresh;