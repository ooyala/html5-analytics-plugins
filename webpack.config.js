/* eslint-disable require-jsdoc */
const path = require('path');
const globEntries = require('webpack-glob-entries');

const commonConf = options => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  watch: options.mode !== 'production',
  devtool: options.mode !== 'production' ? 'source-map' : false,
  devServer: {
    port: 9005,
    // webpack-dev-server client overrides sockjs-node location if host === '0.0.0.0'
    // to the window.location and it breaks live reload
    // if you want to make webpack-dev-server available from outside (e.g. to debug Android device)
    // change it to 0.0.0.0
    host: 'localhost',
    disableHostCheck: true,
    compress: true,
    inline: true,
  },
});

const pluginDependenciesConfig = {
  entry: globEntries('./js/plugin-dependencies/*/*.js'),
  output: {
    path: path.resolve('./build'),
    filename: '[name].js',
  },
};

const frameworkConfig = {
  entry: globEntries('./js/framework/**/*.js'),
  output: {
    path: path.resolve('./build/js/framework'),
    filename: '[name].js',
  },
};

const pluginsConfig = {
  entry: globEntries('./js/plugins/**/*.js'),
  output: {
    path: path.resolve('./build/js/plugins'),
    filename: '[name].js',
  },
};

module.exports = (env, options) => [
  {
    ...commonConf(options),
    ...pluginDependenciesConfig,
  },
  {
    ...commonConf(options),
    ...frameworkConfig,
  },
  {
    ...commonConf(options),
    ...pluginsConfig,
  },
];
