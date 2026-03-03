// Appwrite client configuration
import { Client, Account, ID } from 'appwrite';

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '698b10ae00327f4c4cab');

export const account = new Account(client);
export { ID };
export default client;
