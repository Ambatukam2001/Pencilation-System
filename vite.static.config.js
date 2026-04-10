import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Emits compiled Tailwind for static files under public/*.html (no CDN). */
export default defineConfig({
    publicDir: false,
    plugins: [tailwindcss()],
    build: {
        outDir: 'public',
        emptyOutDir: false,
        rollupOptions: {
            input: resolve(__dirname, 'resources/js/public-pages-entry.js'),
            output: {
                assetFileNames: 'css/public-pages[extname]',
                entryFileNames: 'js/public-pages-build.js',
            },
        },
    },
});
