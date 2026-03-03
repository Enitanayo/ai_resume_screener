// Environment configuration
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID || '698b10ae00327f4c4cab',
  APP_NAME: 'Intelligent Resume Screener',
  APP_VERSION: '1.0.0',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default ENV;
