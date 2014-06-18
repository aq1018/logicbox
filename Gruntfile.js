'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      lib: {
        src: ['lib/**/*.js']
      },
      spec: {
        src: ['spec/**/*.js']
      }
    },

    mochaTest: {
      all: {
        src: ['spec/*.spec.js']
      }
    }
  });

  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('ci', ['jshint', 'test']);
  grunt.registerTask('default', 'ci');
};

