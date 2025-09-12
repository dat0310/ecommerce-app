const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  chainWebpack: config => {
    // Disable ESLint plugin during build to avoid build failures on lint errors
    config.plugins.delete('eslint')
  }
})
