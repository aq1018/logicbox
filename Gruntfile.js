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

        mochacov: {
            coveralls: {
                options: {
                    coveralls: true
                }
            },
            covHtml: {
                options: {
                    reporter: 'html-cov',
                    output: 'coverage/index.html'
                }
            },
            test: {
                options: {
                    reporter: 'spec'
                }
            },
            options: {
                files: 'test/*.test.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-cov');

    grunt.registerTask('default', ['test']);
    grunt.registerTask('test', ['jshint', 'mochacov:test']);
    grunt.registerTask('cov', ['jshint', 'mochacov:covHtml']);
    grunt.registerTask('ci', ['test', 'mochacov:coveralls']);
};
