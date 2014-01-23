'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig( {
        jshint: {
            all: ['Gruntfile.js', 'index.js', 'test/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    require: 'test/support/blanket'
                },
                src: ['test/**/*.test.js']
            }
        },

        coveralls: {
            options: {
                src: 'coverage/lcov.info'
            }
        }
    });

    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-coveralls');

    grunt.registerTask('default', ['test']);
    grunt.registerTask('test', ['jshint', 'mochaTest']);
};
