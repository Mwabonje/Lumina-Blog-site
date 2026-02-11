import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Specific defaults for your project
  const defaultUrl = 'https://jvniieomnaeiibrnvidz.supabase.co';
  const defaultKey = 'sb_publishable_EyalFOiT9Y9ozrdbzfBP3Q_Rt5WBbMY';

  return {
    plugins: [react()],
    define: {
      // Fallback to empty string if undefined to prevent ReferenceError
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.ADMIN_EMAIL': JSON.stringify(env.ADMIN_EMAIL || 'admin@lumina.com'),
      'process.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD || 'password'),
    }
  };
});