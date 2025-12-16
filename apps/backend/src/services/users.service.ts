import { error } from "console";
import { db } from "../config/db.js";
import { User } from "../models/users.model.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import { sendResetEmail } from "../config/mailer.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const UserService = {
    async getUser(email: string): Promise<User | null> {
        const result = await db.query<User>(
            `SELECT * FROM users WHERE email = $1 LIMIT 1;`,
            [email]
        );
        return result.rows[0] || null;
    },


    async registerUser(email: string, nickname: string, password: string): Promise<User> {
    const existingUser = await this.getUser(email);
    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query<User>(
        `
        INSERT INTO users (email, nickname, password, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
        `,
        [email, nickname, hashedPassword]
    );

    return result.rows[0];
},

async googleAuth(idToken: string): Promise<User> {
    const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error("Invalid Google token");

    const email = payload.email;
    const nickname = payload.name || payload.given_name || email.split("@")[0];

    let user = await this.getUser(email);

    if (!user) {
    const randomPassword = crypto.randomBytes(32).toString("hex"); 
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const result = await db.query<User>(
        `
        INSERT INTO users (email, nickname, password, auth_provider, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
        `,
        [email, nickname, hashedPassword, "google"]
    );
    user = result.rows[0];
    }

    return user;
},

async loginUser(email: string, password: string): Promise<User> {
    const user = await this.getUser(email);
    if (!user) throw new Error("Invalid email");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid password");

    return user;
},

async comparePasswords(email: string, password: string): Promise<boolean> {
  const user = await this.getUser(email);
  if (!user) throw new Error("Invalid email");

  const validPassword = await bcrypt.compare(password, user.password);
  return validPassword; 
},


async addUser(email: string, nickname: string, password: string, profile_picture: string, bio: string, preferred_budget_range: string, preferred_venue_atmosphere: string, preferred_beer_style_id: number, xp: number, level: number): Promise<User> {
    const result = await db.query<User>(
        `
        INSERT INTO users (email, nickname, password, profile_picture, bio, preferred_budget_range, preferred_venue_atmosphere, preferred_beer_style_id, xp, level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
        `,
        [email, nickname, password, profile_picture, bio, preferred_budget_range, preferred_venue_atmosphere, preferred_beer_style_id, xp, level]
    );

    return result.rows[0];
},

async getUserById(user_id: number): Promise<User | null> {
    const result = await db.query<User>(`SELECT * FROM users WHERE user_id = $1 LIMIT 1;`, [user_id]);
    return result.rows[0] || null;
},

async editUser(user_id: number, updateData: Partial<User>): Promise<User | null> {
    const user = await this.getUserById(user_id);
    if (!user) {
        return null;
    }

    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const fields = Object.keys(updateData).filter(key => (updateData as any)[key] !== undefined);

    if (fields.length === 0) {
        return user;
    }

    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");

    const values = fields.map(field => updateData[field as keyof User]);

    const query = `
    UPDATE users
    SET ${setClause}
    WHERE user_id = $${fields.length + 1}
    RETURNING *;
`;

    const result = await db.query<User>(query, [...values, user_id]);

    return result.rows[0];
},

async updateUser(user_id: number, updateData: Partial<User>): Promise<User | null> {
    const user = await this.getUserById(user_id);
    if (!user) return null;

    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const fields = Object.keys(updateData).filter(
        key => (updateData as any)[key] !== undefined
    );

    if (fields.length === 0) return user;

    const setClause = fields.map((field, i) => `"${field}" = $${i + 1}`).join(", ");
    const values = fields.map(field => updateData[field as keyof User]);

    const query = `
    UPDATE users
    SET ${setClause}
    WHERE user_id = $${fields.length + 1}
    RETURNING *;
`;

    const result = await db.query<User>(query, [...values, user_id]);
    return result.rows[0];
},


async editUserPreference(user_id: number, updateData: Partial<User>): Promise<User | null> {
    const user = await this.getUserById(user_id);
    if (!user) {
        return null;
    }

    const fields = Object.keys(updateData).filter(key => (updateData as any)[key] !== undefined);

    if (fields.length === 0) {
        return user;
    }

    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");

    const values = fields.map(field => updateData[field as keyof User]);

    const query = `
    UPDATE users
    SET ${setClause}
    WHERE user_id = $${fields.length + 1}
    RETURNING *;
`;

    const result = await db.query<User>(query, [...values, user_id]);

    return result.rows[0];
},

async deleteUser(id: number): Promise<number | null> {
    const query = "DELETE FROM users WHERE user_id = $1";
    const values = [id];
    const result = await db.query(query, values);
    return result.rowCount;
},

async getAllUsers(): Promise<User[]> {
    const result = await db.query<User>(`SELECT * FROM users;`);
    return result.rows;
},

async getUserQuests(userId: number): Promise<any[]> {
    const query = `
        SELECT 
            q.quest_id,
            q.title,
            q.description,
            q.requirements,
            q.rewards,
            q.validity_end,
            uq.progress,
            uq.completed_at
        FROM user_quests uq
        JOIN quests q ON uq.quest_id = q.quest_id
        WHERE uq.user_id = $1
        ORDER BY uq.completed_at DESC, q.validity_end ASC;
    `;

    const result = await db.query(query, [userId]);
    
    return result.rows.map(row => ({
        quest_id: row.quest_id,
        title: row.title,
        description: row.description,
        xp_reward: row.rewards?.xp || 0,
        target: (row.requirements?.visits || row.requirements?.count || 1),
        progress: row.progress?.current_count || 0,
        status: row.completed_at ? 'completed' : 'active',
        validity_end: row.validity_end,
    }));
},

async acceptQuest(userId: number, questId: number): Promise<any> {
    const existing = await db.query(
        `SELECT * FROM user_quests WHERE user_id = $1 AND quest_id = $2`,
        [userId, questId]
    );
    if (existing.rows.length > 0) {
        throw new Error("Quest already accepted.");
    }

    const initialProgress = { "current_count": 0, "visited_ids": [] };

    const result = await db.query(
        `INSERT INTO user_quests (user_id, quest_id, progress) VALUES ($1, $2, $3) RETURNING *`,
        [userId, questId, initialProgress]
    );
    return result.rows[0];
},

async abandonQuest(userId: number, questId: number): Promise<number | null> {
    const result = await db.query(
        `DELETE FROM user_quests WHERE user_id = $1 AND quest_id = $2`,
        [userId, questId]
    );
    return result.rowCount;
},

async checkRouteProgress(userId: number, locationIds: number[]): Promise<{ completedQuests: any[], newLevel?: number, newXp?: number }> {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const completedQuests = [];
        let totalXpGained = 0;

        const activeQuestsRes = await client.query(`
            SELECT 
                q.*, 
                uq.progress,
                uq.quest_id as user_quest_id_ref
            FROM user_quests uq
            JOIN quests q ON uq.quest_id = q.quest_id
            WHERE uq.user_id = $1 AND uq.completed_at IS NULL
        `, [userId]);

        if (activeQuestsRes.rows.length === 0) {
            await client.query('COMMIT');
            return { completedQuests: [] };
        }

        const questIds = activeQuestsRes.rows.map(r => r.quest_id);
        let questLocationMap = new Map<number, number[]>();

        if (questIds.length > 0) {
            const questLocsRes = await client.query(`
                SELECT quest_id, location_id 
                FROM quest_locations 
                WHERE quest_id = ANY($1::int[])
            `, [questIds]);

            questLocsRes.rows.forEach(row => {
                if (!questLocationMap.has(row.quest_id)) {
                    questLocationMap.set(row.quest_id, []);
                }
                questLocationMap.get(row.quest_id)?.push(Number(row.location_id));
            });
        }
        
        const locationsInRouteRes = await client.query(`
            SELECT 
                l.location_id, l.average_budget_requirment,
                COALESCE(ARRAY_AGG(DISTINCT lat.atmosphere_tag), '{}') as atmospheres,
                COALESCE(ARRAY_AGG(DISTINCT lbs.beer_style_id) FILTER (WHERE lbs.beer_style_id IS NOT NULL), '{}') as beer_styles
            FROM locations l
            LEFT JOIN location_atmosphere_tags lat ON l.location_id = lat.location_id
            LEFT JOIN location_beer_styles lbs ON l.location_id = lbs.location_id
            WHERE l.location_id = ANY($1::int[])
            GROUP BY l.location_id, l.average_budget_requirment;
        `, [locationIds]);
        const locationsInRoute = locationsInRouteRes.rows;

        for (const quest of activeQuestsRes.rows) {
            const req = quest.requirements;
            if (!req || req.type === 'review') continue;

            let currentCount = parseInt(quest.progress?.current_count || '0');
            let visitedIds: number[] = quest.progress?.visited_ids || [];

            const linkedIds = questLocationMap.get(quest.quest_id) || [];

            const qualifyingLocations = locationsInRoute.filter(loc => {
                const currentLocId = Number(loc.location_id);
                
                if (linkedIds.length > 0 && !linkedIds.includes(currentLocId)) {
                    return false; 
                }
                
                switch(req.type) {
                    case 'visit': 
                        return true; 
                    case 'atmosphere': 
                        return loc.atmospheres && loc.atmospheres.includes(req.target);
                    case 'budget': 
                        return loc.average_budget_requirment === req.target;
                    case 'beer_style': 
                        return loc.beer_styles && loc.beer_styles.some((id: any) => Number(id) === Number(req.target_id));
                    default: 
                        return false;
                }
            });

            let newIdsToAdd: number[] = [];

            if (req.unique) {
                for (const loc of qualifyingLocations) {
                    const locId = Number(loc.location_id);
                    if (!visitedIds.includes(locId)) {
                        newIdsToAdd.push(locId);
                    }
                }
            } else {
                newIdsToAdd = qualifyingLocations.map(l => Number(l.location_id));
            }

            if (newIdsToAdd.length > 0) {
                currentCount += newIdsToAdd.length;
                
                const updatedVisitedIds = Array.from(new Set([...visitedIds, ...newIdsToAdd]));

                const newProgressJson = {
                    current_count: currentCount,
                    visited_ids: updatedVisitedIds
                };

                await client.query(`
                    UPDATE user_quests 
                    SET progress = $1
                    WHERE user_id = $2 AND quest_id = $3
                `, [newProgressJson, userId, quest.quest_id]);
                
                const target = parseInt(req.visits || req.count || '1');
                
                if (currentCount >= target) {
                    await client.query(`
                        UPDATE user_quests
                        SET completed_at = NOW()
                        WHERE user_id = $1 AND quest_id = $2 AND completed_at IS NULL
                    `, [userId, quest.quest_id]);

                    const xpReward = Number(quest.rewards?.xp || 0);
                    totalXpGained += xpReward;
                    completedQuests.push({ title: quest.title, xp: xpReward });
                }
            }
        }

        let finalUserStats = {};
        if (totalXpGained > 0) {
            const userRes = await client.query(`SELECT xp FROM users WHERE user_id = $1 FOR UPDATE`, [userId]);
            const currentXp = Number(userRes.rows[0]?.xp || 0);
            
            const newXp = currentXp + totalXpGained;
            
            let calculatedLevel = 1;
            let increment = 100;
            let threshold = 100;

            while (newXp >= threshold) {
                calculatedLevel++;
                increment = Math.floor(increment * 1.5);
                threshold += increment;
            }

            await client.query(`
                UPDATE users
                SET xp = $1, level = $2
                WHERE user_id = $3
            `, [newXp, calculatedLevel, userId]);
            
            finalUserStats = { newXp, newLevel: calculatedLevel };
        }

        await client.query('COMMIT');
        return { completedQuests, ...finalUserStats };

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
},

async checkReviewQuestProgress(userId: number, locationId: number, rating: number): Promise<{ completedQuests: any[] }> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const completedQuests = [];

            const activeQuestsRes = await client.query(`
                SELECT 
                    q.*, 
                    uq.progress
                FROM user_quests uq
                JOIN quests q ON uq.quest_id = q.quest_id
                WHERE uq.user_id = $1 
                  AND uq.completed_at IS NULL
                  AND q.requirements->>'type' = 'review'
            `, [userId]);

            if (activeQuestsRes.rows.length === 0) {
                await client.query('COMMIT');
                return { completedQuests: [] };
            }

            const questIds = activeQuestsRes.rows.map(r => r.quest_id);
            let questLocationMap = new Map<number, number[]>();

            if (questIds.length > 0) {
                const questLocsRes = await client.query(`
                    SELECT quest_id, location_id 
                    FROM quest_locations 
                    WHERE quest_id = ANY($1::int[])
                `, [questIds]);

                questLocsRes.rows.forEach(row => {
                    if (!questLocationMap.has(row.quest_id)) {
                        questLocationMap.set(row.quest_id, []);
                    }
                    questLocationMap.get(row.quest_id)?.push(Number(row.location_id));
                });
            }

            for (const quest of activeQuestsRes.rows) {
                const req = quest.requirements;
                
                const minRating = req.min_rating || 0;
                if (rating < minRating) continue;

                const linkedIds = questLocationMap.get(quest.quest_id) || [];
                if (linkedIds.length > 0 && !linkedIds.includes(Number(locationId))) {
                    continue;
                }

                let currentCount = parseInt(quest.progress?.current_count || '0');
                let visitedIds: number[] = quest.progress?.visited_ids || [];

                if (!visitedIds.includes(locationId)) {
                    currentCount++;
                    visitedIds.push(locationId);

                    const newProgressJson = {
                        current_count: currentCount,
                        visited_ids: visitedIds
                    };

                    await client.query(`
                        UPDATE user_quests 
                        SET progress = $1
                        WHERE user_id = $2 AND quest_id = $3
                    `, [newProgressJson, userId, quest.quest_id]);

                    const target = parseInt(req.count || '1');

                    if (currentCount >= target) {
                        await client.query(`
                            UPDATE user_quests
                            SET completed_at = NOW()
                            WHERE user_id = $1 AND quest_id = $2 AND completed_at IS NULL
                        `, [userId, quest.quest_id]);

                        const xpReward = parseInt(quest.rewards?.xp || '0');
                        if (xpReward > 0) {
                            await client.query(`
                                UPDATE users
                                SET xp = COALESCE(xp, 0) + $1
                                WHERE user_id = $2
                            `, [xpReward, userId]);
                        }

                        completedQuests.push({ title: quest.title, xp: xpReward });
                    }
                }
            }

            await client.query('COMMIT');
            return { completedQuests };
        } catch (e) {
            await client.query('ROLLBACK');
            console.error("Error checking review quest progress:", e);
            return { completedQuests: [] };
        } finally {
            client.release();
        }
    },

async getLeaderboard(): Promise<any[]> {
        const query = `
            SELECT 
                l.user_id,
                l.nickname,
                l.profile_picture,
                l.xp,
                l.level,
                l.rank,
                (
                    SELECT COUNT(*) 
                    FROM user_quests uq 
                    WHERE uq.user_id = l.user_id AND uq.completed_at IS NOT NULL
                ) as completed_quests
            FROM leaderboard l
            ORDER BY l.rank ASC
            LIMIT 100;
        `;
        const result = await db.query(query);
        return result.rows;
    },

    async resetPassword(email: string): Promise<boolean> {
        const user = await this.getUser(email);
        if (!user) return false;

        const newPassword = crypto.randomBytes(4).toString("hex");

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query("UPDATE users SET password = $1 WHERE user_id = $2", [hashedPassword, user.user_id]);

        await sendResetEmail(email, newPassword, user.nickname);

        return true;
    }
}