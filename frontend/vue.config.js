const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  chainWebpack: config => {
    // Disable ESLint plugin during build to avoid build failures on lint errors
    config.plugins.delete('eslint')
  },
  devServer: {
    proxy: {
      '/uploads': {
        target: 'http://product-service:3001',
        changeOrigin: true
      }
    }
  }
})
