import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Clear console on hot reload
    clearScreen: false,
    // Tauri expects a fixed port
    server: {
        port: 3000,
        strictPort: true,
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true
            },
            '/uploads': {
                target: 'http://localhost:3001',
                changeOrigin: true
            }
        }
    },
    // For production build
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        // Tauri supports es2021
        target: ['es2021', 'chrome100', 'safari13'],
        // Don't inline assets
        assetsInlineLimit: 0
    }
});

