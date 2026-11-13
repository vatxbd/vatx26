import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      modulePreload: false,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('tesseract.js')) return 'tesseract';
            if (id.includes('pdfjs-dist') || id.includes('pdf-lib')) return 'pdf';
            if (id.includes('exceljs') || id.includes('node_modules/docx') || id.includes('mammoth')) return 'excel';
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts';
            if (id.includes('motion') || id.includes('framer-motion')) return 'motion';
            if (id.includes('@google/genai') || id.includes('googleapis')) return 'genai';
            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
