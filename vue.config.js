const webpack = require('webpack')
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
      }
    },
    plugins: [
      new webpack.ProvidePlugin({

        $: "jquery",

        jQuery: "jquery",

        "windows.jQuery": "jquery"

      })


    ]
  },

}