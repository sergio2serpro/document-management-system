import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração mínima do Vite. O proxy direciona chamadas /api para o backend
// local durante o desenvolvimento (Passo 3 e Passo 4 - integração).
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // o transform padrão do build (oxc) já resolve o JSX automático; o Vitest
  // precisa da configuração explícita do esbuild para o mesmo comportamento.
  esbuild: command === 'build' ? undefined : { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/setupTests.js', '**/*.test.{js,jsx}'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}));
