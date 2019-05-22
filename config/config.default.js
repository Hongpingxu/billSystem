/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1552179135060_276';

  // add your middleware config here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
      // ignoreJSON: true,
    },
    // domainWhiteList: [ 'http://localhost:8080' ],
  };
  config.cors = {
    // origin: 'http://127.0.0.1:8099',
    origin: 'http://127.0.0.1:8888',
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  config.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: 'root',
      database: 'billingsystem',
    },
    app: true,
    agent: false,
  }

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
