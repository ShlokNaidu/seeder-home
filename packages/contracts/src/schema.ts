export interface PrismaField {
    name: string;
    type: string;
    isId: boolean;
    isUnique: boolean;
    isRequired: boolean;
    isList: boolean;
    relationName?: string;
}

export interface PrismaModel {
    name: string;
    fields: PrismaField[];
}

export interface SchemaRegistry {
    models: PrismaModel[];
}
