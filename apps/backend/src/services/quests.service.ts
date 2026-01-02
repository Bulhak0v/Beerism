import { db } from "../config/db.js";
import { Quest } from "../models/quests.model.js";

export const QuestsService = {
    async getAllQuests(): Promise<Quest[]> {
        const query = `
            SELECT 
                q.*,
                COALESCE(JSON_AGG(ql.location_id::int) FILTER (WHERE ql.location_id IS NOT NULL), '[]') as linked_location_ids
            FROM quests q
            LEFT JOIN quest_locations ql ON q.quest_id = ql.quest_id
            GROUP BY q.quest_id
            ORDER BY q.quest_id ASC;
        `;
        const result = await db.query(query);
        return result.rows;
    },

    async deleteQuest(id: number): Promise<number | null> {
        await db.query("DELETE FROM quest_locations WHERE quest_id = $1", [id]);
        const result = await db.query("DELETE FROM quests WHERE quest_id = $1", [id]);
        return result.rowCount;
    },

    async addQuest(
        title: string, 
        description: string, 
        requirements: any, 
        rewards: any, 
        validity_start: string, 
        validity_end: string, 
        location_ids: number[]
    ): Promise<Quest> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const res = await client.query(
                `INSERT INTO quests (title, description, requirements, rewards, validity_start, validity_end)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [title, description, requirements, rewards, validity_start, validity_end]
            );
            const newQuest = res.rows[0];

            if (location_ids && location_ids.length > 0) {
                const uniqueLocationIds = [...new Set(location_ids)];
                
                for (const locId of uniqueLocationIds) {
                    await client.query(
                        `INSERT INTO quest_locations (quest_id, location_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING`,
                        [newQuest.quest_id, locId]
                    );
                }
            }

            const savedLocationsRes = await client.query(
                `SELECT location_id::int as location_id 
                FROM quest_locations 
                WHERE quest_id = $1 
                ORDER BY location_id`,
                [newQuest.quest_id]
            );
            const savedLocationIds = savedLocationsRes.rows.map(row => row.location_id);

            await client.query('COMMIT');
            
            return { ...newQuest, linked_location_ids: savedLocationIds };
        } catch (e) {
            await client.query('ROLLBACK');
            console.error("Error in addQuest service:", e);
            throw e;
        } finally {
            client.release();
        }
    },

    async updateQuest(
        id: number,
        title: string, 
        description: string, 
        requirements: any, 
        rewards: any, 
        validity_start: string, 
        validity_end: string, 
        location_ids: number[]
    ): Promise<Quest> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const res = await client.query(
                `UPDATE quests 
                SET title = $1, description = $2, requirements = $3, rewards = $4, validity_start = $5, validity_end = $6
                WHERE quest_id = $7
                RETURNING *`,
                [title, description, requirements, rewards, validity_start, validity_end, id]
            );

            if (res.rows.length === 0) throw new Error("Quest not found");
            const updatedQuest = res.rows[0];

            await client.query(`DELETE FROM quest_locations WHERE quest_id = $1`, [id]);

            if (location_ids && location_ids.length > 0) {
                const uniqueLocationIds = [...new Set(location_ids)];
                
                for (const locId of uniqueLocationIds) {
                    await client.query(
                        `INSERT INTO quest_locations (quest_id, location_id) 
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING`,
                        [id, locId]
                    );
                }
            }

            const savedLocationsRes = await client.query(
                `SELECT location_id::int as location_id 
                FROM quest_locations 
                WHERE quest_id = $1 
                ORDER BY location_id`,
                [id]
            );
            const savedLocationIds = savedLocationsRes.rows.map(row => row.location_id);

            await client.query('COMMIT');
            
            return { ...updatedQuest, linked_location_ids: savedLocationIds };
        } catch (e) {
            await client.query('ROLLBACK');
            console.error("Error in updateQuest service:", e);
            throw e;
        } finally {
            client.release();
        }
    },
    async getAvailableQuestsForUser(userId: number): Promise<any[]> {
        const query = `
            SELECT q.*
            FROM quests q
            WHERE 
                q.validity_start <= NOW() AND q.validity_end >= NOW()
                AND NOT EXISTS (
                    SELECT 1 FROM user_quests uq 
                    WHERE uq.quest_id = q.quest_id AND uq.user_id = $1
                );
        `;
        const result = await db.query(query, [userId]);
        
        return result.rows.map(row => ({
            quest_id: row.quest_id,
            title: row.title,
            description: row.description,
            xp_reward: row.rewards?.xp || 0,
            target: (row.requirements?.visits || row.requirements?.count || 1),
            progress: 0,
            status: 'available',
            validity_end: row.validity_end,
        }));
    }
};