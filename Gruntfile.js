'use strict';

module.exports = function(grunt) {

    var pkg = require('./package.json');
    var globalConfig = {
        repo: pkg.repository.url
    };

    // Project configuration.
    grunt.initConfig( {
        globalConfig: globalConfig,

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
        },

        bump: {
            options: {
                files: ['package.json', 'component.json', 'bower.json'],
                commitFiles: ['-a'],
                pushTo: 'origin master'
            }
        },

        exec: {
            releaseNpm: {
                cmd: "npm publish ."
            },

            releaseBower: {
                cmd: "bower register logicbox <%= globalConfig.repo %>"
            }
        }
    });

    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-cov');

    grunt.registerTask('default', ['test']);
    grunt.registerTask('test', ['jshint', 'mochacov:test']);
    grunt.registerTask('cov', ['jshint', 'mochacov:covHtml']);
    grunt.registerTask('ci', ['test', 'mochacov:coveralls']);
    grunt.registerTask('release:npm', ['exec:releaseNpm']);
    grunt.registerTask('release:bower', ['exec:releaseBower']);
    grunt.registerTask('release', ['release:npm', 'release:bower']);
};
