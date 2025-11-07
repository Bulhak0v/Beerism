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
    const userId = req.body.user_id;
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

export async function editUserPreference(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.body.user_id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user token." });
    }

    const {
        preferred_budget_range,
        preferred_venue_atmosphere,
        preferred_beer_style_id
    } = req.body;



    const updateData: Partial<User> = {
      ...(preferred_budget_range && { preferred_budget_range }),
      ...(preferred_venue_atmosphere && { preferred_venue_atmosphere }),
      ...(preferred_beer_style_id && { preferred_beer_style_id })
    };

    const updatedUser = await UserService.editUserPreference(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(updatedUser);

  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({ message: "An error occurred while updating the user." });
  }
}

export async function addUser(req: Request, res: Response) {
  try {
    const {
      email,
      nickname,
      password,
      profile_picture,
      bio,
      preferred_budget_range,
      preferred_venue_atmosphere,
      preferred_beer_style_id,
      xp,
      level
    } = req.body;

    if (!email || !nickname || !password) {
      return res.status(400).json({ message: "Email, nickname и password обязательны." });
    }

    const newUser = await UserService.addUser(
      email,
      nickname,
      password,
      profile_picture,
      bio,
      preferred_budget_range,
      preferred_venue_atmosphere,
      preferred_beer_style_id,
      xp,
      level
    );

    return res.status(201).json(newUser);
  } catch (error: any) {
    console.error("Error adding user:", error);
    return res.status(500).json({ message: "Error adding user: " + error.message });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const {
      email,
      nickname,
      password,
      profile_picture,
      bio,
      preferred_budget_range,
      preferred_venue_atmosphere,
      preferred_beer_style_id,
      xp,
      level
    } = req.body;

    const updateData: Partial<User> = {
      ...(email && { email }),
      ...(nickname && { nickname }),
      ...(password && { password }),
      ...(profile_picture && { profile_picture }),
      ...(bio && { bio }),
      ...(preferred_budget_range && { preferred_budget_range }),
      ...(preferred_venue_atmosphere && { preferred_venue_atmosphere }),
      ...(preferred_beer_style_id && { preferred_beer_style_id }),
      ...(xp !== undefined && { xp }),
      ...(level !== undefined && { level })
    };

    const updatedUser = await UserService.updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Error updating user: " + error.message });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const deleted = await UserService.deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Error deleting user: " + error.message });
  }
}