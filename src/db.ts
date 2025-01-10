import { Client } from 'pg';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5400', 10)
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Error connecting to PostgreSQL:", err));

export default client;