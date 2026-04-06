export interface FirebaseNotification {
    id?: number;
    userId?: string; // Guid is represented as a string in TypeScript
    createdDate?: Date;
    title?: string;
    body?: string;
    type?: string;
    value?: string;
    isNew?:boolean;
}
