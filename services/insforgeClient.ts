import { createClient } from '@insforge/sdk';

// Vite requires VITE_ prefix for client-side environment variables
const insforgeUrl = import.meta.env.VITE_INSFORGE_URL || 'https://gn9nuyhp.us-west.insforge.app';
const insforgeKey = import.meta.env.VITE_INSFORGE_KEY || 'ik_81d379bb6924e4821faeae92696bb105';

console.log("InsForge Client Initializing...");
console.log("URL:", insforgeUrl);
console.log("Key Loaded:", insforgeKey ? "YES (starts with " + insforgeKey.substring(0, 5) + "...)" : "NO");

if (!insforgeUrl || !insforgeKey) {
    console.warn('InsForge configuration missing. Using defaults if available.');
}

export const insforge = createClient({
    baseUrl: insforgeUrl,
    anonKey: insforgeKey,
});
