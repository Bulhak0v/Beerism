import { Request, Response } from "express";
import { UserService } from "../services/users.service.js";

export async function registerUser(req: Request, res: Response) {
    const { email, nickname, password } = req.body;

    try {
        const newUser = await UserService.registerUser(email, nickname, password);
        res.status(201).json(newUser);
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            return res.status(400).json({message: error.message});
        }
        console.error("Error registering user:", error);
        res.status(500).json({message: "Internal server error"});
    }
}