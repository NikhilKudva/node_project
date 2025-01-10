"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db")); // Assuming client is set up to connect to PostgreSQL
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json()); // To parse JSON request bodies
// GET: Fetch a user by ID
app.get("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const result = yield db_1.default.query("SELECT * FROM users WHERE id = $1", [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
// POST: Create a new user
app.post("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }
    try {
        const result = yield db_1.default.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *", [name, email, password]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
// PUT: Update an existing user
app.put("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!id || (!name && !email)) {
        return res.status(400).json({ message: "User ID and at least one of name or email are required" });
    }
    try {
        const result = yield db_1.default.query("UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *", [name, email, id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
// DELETE: Delete a user
app.delete("/user/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const result = yield db_1.default.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length > 0) {
            res.json({ message: "User deleted successfully" });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
