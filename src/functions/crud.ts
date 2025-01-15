import express, { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import expressRedisCache from 'express-redis-cache';
import { error } from 'console';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

const redisClient = new Redis();

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const cache = expressRedisCache({ client: redisClient });

const getUser = async (req: Request, res: Response) => {
const { id } = req.params;
try{
const user = await User.findByPk(id);
if(user){
    res.json(user);
}else{
    res.status(404).json({message: 'User not found'});
}
}catch(error){
    console.error(error);
    res.status(500).json({message: 'Internal Server Error'});
}
};

const createUser = async (req: Request, res: Response) => {
    try{
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            res.status(400).json({message: 'Name, email and password are required'});
            return;
        }
        const user = await User.create({name,email,password});
        cache.del('/user/*',(error) => {
            if(error){
                console.error('Error deleting cache:',error);
                
        }else{
            console.log('Cache deleted successfully');
        }});
        res.status(201).json(user);
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

const updateUser = async (req: Request, res: Response) => {
    const {id} = req.params;
try{
    const user = await User.findByPk(id);
    if(user){
        await user.update(req.body);
        cache.del(`/user/${id}`,(error) => {
            if(error){
                console.error('Error deleting cache:',error);
            }else{
                console.log('Cache deleted successfully');
            }
        });
        res.json(user);
    }else{
        res.status(404).json({message: 'User not found'});
    }
}catch(error){
    console.error(error);
    res.status(500).json({message: 'Internal Server Error'});
}
};

const deleteUser = async (req: Request, res: Response) => {
    const {id} = req.params;
    try{
        const user = await User.findByPk(id);
        if(user){
            await user.destroy();
            cache.del(`/user/${id}`,(error) => {
                if(error){
                    console.error('Error deleting cache:',error);
                }else{
                    console.log('Cache deleted successfully');
                }
            });
            res.json({message: 'User deleted successfully'});
        }else{
            res.status(404).json({message: 'User not found'});
        }
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
};

export {getUser,createUser,updateUser,deleteUser};