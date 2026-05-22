import { Storage } from '@google-cloud/storage';

// In production on Vercel, we pass the raw JSON string as an env variable.
// In local dev, we point to the local key file.
let storage: Storage;

if (process.env.GCS_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GCS_CREDENTIALS_JSON);
  storage = new Storage({ credentials });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
} else {
  // Fallback for local mac
  storage = new Storage({ keyFilename: '/Users/dineshsm/Documents/production/visu_production/pos_sweethearting/keys/production-key.json' });
}

export const gcs = storage;
export const BUCKET_NAME = 'visu-cashier-pro-cashier-bucket';
