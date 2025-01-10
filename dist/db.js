"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const client = new pg_1.Client({
    user: 'nikhil',
    host: 'localhost',
    database: 'nikhil',
    password: 'nikhil123',
    port: 5400,
});
client.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => console.error("Error connecting to PostgreSQL:", err));
exports.default = client;
