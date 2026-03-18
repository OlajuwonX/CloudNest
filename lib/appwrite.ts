import { Account, Client, Databases, Storage } from "react-native-appwrite";

const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const PLATFORM = process.env.EXPO_PUBLIC_APPWRITE_PLATFORM;

if (!ENDPOINT || !PROJECT_ID || !PLATFORM) {
  throw new Error(
    `[CloudNest] Missing Appwrite environment variables.\n` +
      `Make sure your .env file contains:\n` +
      `  EXPO_PUBLIC_APPWRITE_ENDPOINT   → ${ENDPOINT ?? "❌ missing"}\n` +
      `  EXPO_PUBLIC_APPWRITE_PROJECT_ID → ${PROJECT_ID ?? "❌ missing"}\n` +
      `  EXPO_PUBLIC_APPWRITE_PLATFORM   → ${PLATFORM ?? "❌ missing"}`,
  );
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setPlatform(PLATFORM);

// ─── Service Instances ─── //
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;

// appwrite Email Verification & Password Reset Setup
// 1. create separate platforms in Appwrite for mobile deep links:
//    - CloudNest (main app)
//    - verify-email (deep link for email verification)
//    - reset-password (deep link for password reset)
// 2. each platform uses the same Android package identifier: co.phantomdev.cloudnest
// 3. custom URI schemes (cloudnest://verify-email, cloudnest://reset-password) are used
//    for mobile deep linking instead of web URLs.
// 4. App now listens to these deep links to navigate to the appropriate screens.
// 5. This setup resolves the "Invalid 'url' param" errors and works on the free tier.
