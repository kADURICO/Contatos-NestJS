export class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
    contacts?: any[];
}
