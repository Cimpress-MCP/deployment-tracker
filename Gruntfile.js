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
    },
    watch: {
      scripts: {
        files: ['**/*.js', '**/*.yaml'],
        tasks: ['jshint', 'express:dev'],
        options: {
          spawn: false,
        },
      },
    },
    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'app.js',
          output: "Deployment Tracker listening on port .*",
          port: 8080
        }
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'mochaTest']);
  grunt.registerTask('server', ['express:dev', 'watch']);
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
};
