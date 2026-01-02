export interface Quest {
    quest_id: number;
    title: string;
    description: string;
    requirements: any;
    rewards: any;
    validity_start: Date | string;
    validity_end: Date | string;
    
    linked_location_ids?: number[]; 
}