import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    esbuild: {
      drop: isProd ? ['debugger'] : [],
      pure: isProd ? ['console.log', 'console.debug'] : [],
    },
    plugins: [
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      svgr({
        // SVGR options: https://react-svgr.com/docs/options/
        svgrOptions: {
          exportType: 'default',
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: '**/*.svg',
      }),
      tailwindcss(),
      tanstackStart(),
      viteReact({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
    ],
    ssr: {
      external: ['axios', 'proxy-from-env'],
    },
    build: {
      rollupOptions: {
        external: ['vaul'],
      },
    },
  }
})
