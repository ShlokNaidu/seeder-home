import { Client } from 'pg';
import { DatabaseObservation } from '@seeder/contracts';

export class DatabaseObserver {
    private client: Client;

    constructor(connectionString: string) {
        this.client = new Client({ connectionString });
    }

    async connect() {
        await this.client.connect();
    }

    async disconnect() {
        await this.client.end();
    }

    async preSnapshot(tableName: string): Promise<number> {
        // Just return the count for simplicity in this MVP
        const res = await this.client.query(`SELECT COUNT(*) FROM "${tableName}"`);
        return parseInt(res.rows[0].count, 10);
    }

    async locateProbeRecords(tableName: string, signature: string): Promise<any[]> {
        // Search string columns for the signature. 
        // For this MVP, we know the "name" column is where the signature goes for Company
        const query = `SELECT * FROM "${tableName}" WHERE name = $1`;
        const res = await this.client.query(query, [signature]);
        return res.rows;
    }

    async postSnapshot(tableName: string): Promise<number> {
        const res = await this.client.query(`SELECT COUNT(*) FROM "${tableName}"`);
        return parseInt(res.rows[0].count, 10);
    }

    async rollback(tableName: string, signature: string): Promise<number> {
        // Parameterized delete
        const query = `DELETE FROM "${tableName}" WHERE name = $1 RETurning id`;
        const res = await this.client.query(query, [signature]);
        return res.rowCount || 0;
    }
}
