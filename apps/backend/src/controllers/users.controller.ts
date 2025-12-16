import { Request, Response } from "express";
import { UserService } from "../services/users.service.js";
import { User } from "../models/users.model.js";
import { LocationsService } from "../services/locations.service.js";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

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

export async function comparePasswords(req: Request, res: Response){
   const {email, password } = req.body;

    try {
      const isValid = await UserService.comparePasswords(email, password);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      return res.status(200).json({ message: "Password is correct" });
    } catch (error: any) {
      console.error("Error comparing passwords:", error);
      return res.status(500).json({ message: "Internal server error" });
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
    xp?: number;
    level?: number;
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
      ...(preferred_budget_range !== undefined && { preferred_budget_range }),
      ...(preferred_venue_atmosphere !== undefined && { preferred_venue_atmosphere }),
      ...(preferred_beer_style_id !== undefined && { preferred_beer_style_id })
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
      ...(preferred_budget_range !== undefined && { preferred_budget_range }),
      ...(preferred_venue_atmosphere !== undefined && { preferred_venue_atmosphere }),
      ...(preferred_beer_style_id !== undefined && { preferred_beer_style_id }),
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

export async function getRecommendedLocations(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const city = req.query.city;
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ message: "Missing or invalid 'city' query parameter." });
    }

    const recommended = await LocationsService.getRecommendedLocations(userId, city);
    return res.status(200).json(recommended);
  } catch (err: any) {
    if (err.message === "User not found") {
      return res.status(404).json({ message: err.message });
    }
    console.error("Error getting recommendations:", err);
    return res.status(500).json({ message: "An error occurred while fetching recommendations." });
  }
}

export async function getUserQuests(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        const quests = await UserService.getUserQuests(userId);
        res.status(200).json(quests);

    } catch (error: any) {
        console.error("Error fetching user quests:", error);
        return res.status(500).json({ message: "Error fetching user quests." });
    }
}

export async function googleAuth(req: Request, res: Response) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Missing Google token." });
    }

    const user = await UserService.googleAuth(token);
    res.status(200).json({ user });
  } catch (err: any) {
    console.error("Google Auth failed:", err);
    res
      .status(401)
      .json({ message: err.message || "Google authentication failed" });
  }
}

export async function acceptUserQuest(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.id);
        const questId = parseInt(req.params.questId);
        if (isNaN(userId) || isNaN(questId)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }
        await UserService.acceptQuest(userId, questId);
        res.status(201).json({ message: "Quest accepted." });
    } catch (error: any) {
        console.error("Error accepting quest:", error);
        res.status(500).json({ message: error.message });
    }
}

export async function abandonUserQuest(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.id);
        const questId = parseInt(req.params.questId);
        if (isNaN(userId) || isNaN(questId)) {
            return res.status(400).json({ message: "Invalid ID format." });
        }
        await UserService.abandonQuest(userId, questId);
        res.status(200).json({ message: "Quest abandoned." });
    } catch (error: any) {
        console.error("Error abandoning quest:", error);
        res.status(500).json({ message: error.message });
    }
}

export async function checkRouteProgress(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.id);
        const { locationIds } = req.body;

        if (isNaN(userId) || !Array.isArray(locationIds)) {
            return res.status(400).json({ message: "Invalid user ID or locationIds format." });
        }

        const result = await UserService.checkRouteProgress(userId, locationIds);
        res.status(200).json(result);

    } catch (error: any) {
        console.error("Error checking route progress:", error);
        return res.status(500).json({ message: "Error checking route progress." });
    }
}

export async function getLeaderboard(req: Request, res: Response) {
    try {
        const leaderboard = await UserService.getLeaderboard();
        res.status(200).json(leaderboard);
    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function forgotPassword(req: Request, res: Response) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const success = await UserService.resetPassword(email);
        
        if (!success) {
            return res.status(404).json({ message: "User with this email not found." });
        }

        res.status(200).json({ message: "Password reset email sent." });
    } catch (error: any) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}