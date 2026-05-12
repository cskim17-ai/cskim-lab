import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // 1. 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 2. 깃허브 페이지 배포를 위한 베이스 경로 설정 (AI Studio 미리보기 환경에서는 '/' 사용)
    base: process.env.GITHUB_ACTIONS ? '/cskim-lab/' : '/', 
    
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'cskim-lab 관리자',
          short_name: 'cskim-lab',
          description: 'cskim-lab 전문가용 관리자 대시보드',
          theme_color: '#0a0a0a',
          background_color: '#0a0a0a',
          display: 'standalone',
          icons: [
            {
              src: 'https://cdn-icons-png.flaticon.com/512/3649/3649474.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://cdn-icons-png.flaticon.com/512/3649/3649474.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, './src/shared'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          srchView: path.resolve(__dirname, 'srch-view.html')
        }
      }
    }
  };
});