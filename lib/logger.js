"use strict";

var util = require("util");
var path = require("path");
var bunyan = require("bunyan");

var defaultConfig = {
  name: "deployment-tracker",
  streams: [{
    level: process.env.DEPLOYMENT_TRACKER_LOG_LEVEL || "warn",
    stream: process.stdout
  }]
};

// Create a default logger to use if all else fails.
var defaultLogger = bunyan.createLogger(defaultConfig);

module.exports.setLogDir = function(dir) {
  defaultConfig.streams.push({
    "level": process.env.DEPLOYMENT_TRACKER_LOG_LEVEL || "info",
    "type": "rotating-file",
    "path": path.join(dir, "deployment-tracker.log")
  });

  defaultLogger = bunyan.createLogger(defaultConfig);
};

// Init the logger with a configuration object
module.exports.getLogger = function(config) {

  // If a module was provided, trim it down to just the relative path.
  if (config && config.module) {
    config.module = getModulePath(config.module);
  }

  // If no logger config is provided, there's nothing more to do.  We'll just continue using the
  // default logger.
  if (!config){
    return defaultLogger;
  }

  return defaultLogger.child(config);
};

/**
 * Convenience to get the relative path (that is lib/proxy/index.js or the like) from the full path
 * (/Users/wrb/code/oauth_reverse_proxy/lib/proxy/index.js).  Tagging the logger with the current
 * module is helpful for debugging.
 */
var getModulePath = module.exports.getModulePath = function(moduleFile) {
  var dirs = moduleFile.split(path.sep);
  var modulePath = [];
  for (var i = dirs.length-1; i >= 0; --i) {
    modulePath.unshift(dirs[i]);
    if (dirs[i] === "lib" || dirs[i] === "api") {
      break;
    }
  }

  // We always assume Unix-style path delimiters just to keep the format consistent for logging.
  return modulePath.join("/");
};
