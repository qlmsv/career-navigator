// import './lib/env.mjs' // Removed env validation
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: false, // отключено для экономии памяти
  },
  devIndicators: {
    position: 'bottom-right',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Оптимизация для production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    }

    // Оптимизация для production
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 244000, // 244KB chunks
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 244000,
            },
          },
        },
      }
    }

    return config
  },
}

export default nextConfig
