import { SchemaRegistry, PrismaModel, PrismaField } from '@seeder/contracts';
import * as fs from 'fs/promises';

export class PrismaParser {
    public async parse(schemaPath?: string): Promise<SchemaRegistry | null> {
        if (!schemaPath) {
            console.log("[PrismaParser] No Prisma schema provided. Operating using runtime observations only.");
            return null;
        }

        try {
            const content = await fs.readFile(schemaPath, 'utf8');
            console.log(`[PrismaParser] Parsing schema at ${schemaPath}...`);
            const registry = this.parseSchema(content);
            console.log(`[PrismaParser] Parsed ${registry.models.length} models.`);
            return registry;
        } catch (err: any) {
            console.warn(`[PrismaParser] Failed to read schema file: ${err.message}. Continuing without schema.`);
            return null;
        }
    }

    private parseSchema(content: string): SchemaRegistry {
        const models: PrismaModel[] = [];
        const lines = content.split('\n');
        let currentModel: PrismaModel | null = null;

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed === '') continue;

            if (trimmed.startsWith('model ')) {
                const name = trimmed.split(/\s+/)[1];
                currentModel = { name, fields: [] };
                models.push(currentModel);
                continue;
            }

            if (trimmed === '}' && currentModel) {
                currentModel = null;
                continue;
            }

            if (currentModel && !trimmed.startsWith('@@')) {
                const parts = trimmed.split(/\s+/);
                if (parts.length >= 2) {
                    const fieldName = parts[0];
                    const fieldType = parts[1];
                    
                    const isId = trimmed.includes('@id');
                    const isUnique = trimmed.includes('@unique');
                    const isList = fieldType.includes('[]');
                    const isRequired = !fieldType.includes('?') && !isList;

                    currentModel.fields.push({
                        name: fieldName,
                        type: fieldType.replace('?', '').replace('[]', ''),
                        isId,
                        isUnique,
                        isRequired,
                        isList
                    });
                }
            }
        }

        return { models };
    }
}
