import { Request, Response } from "express";
import { UserService } from "../services/users.service.js";
import { User } from "../models/users.model.js";

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

export async function loginUser(req: Request, res: Response) {
    const {email, password } = req.body;

    try {
        const user = await UserService.loginUser(email, password);
        res.json({user});
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(400).json({message: error.message});
    }
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
  };
}

export async function editUser(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user token." });
    }

    const {
      email,
      nickname,
      password,
      profile_picture,
      bio
    } = req.body;

    const updateData: Partial<User> = {
      ...(email && { email }),
      ...(nickname && { nickname }),
      ...(password && { password }),
      ...(profile_picture && { profile_picture }),
      ...(bio && { bio })
    };

    const updatedUser = await UserService.editUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(updatedUser);

  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "An error occurred while updating the user." });
  }
}
