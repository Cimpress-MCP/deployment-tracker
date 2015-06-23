module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.initConfig({
    jshint: {
      all: ['*.js', 'lib/**/*.js'],
      options: {
        node: true
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*.js']
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'mochaTest']);
};
