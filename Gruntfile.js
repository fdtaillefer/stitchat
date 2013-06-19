module.exports = function(grunt) {
    // Do grunt-related things in here
    grunt.initConfig({
        dustjs: {
            compile: {
                files : {
                    "js/app/templates.js": ["tpl/*.dust"]
                }
            }
        },
        simplemocha: {
            options: {
                //globals: ['should'],
                //timeout: 3000,
                //ignoreLeaks: false,
                //grep: '*-test',
                ui: 'bdd',
                reporter: 'spec'
            },

            all: { src: 'test/*.js' }
        }
    });

    grunt.loadNpmTasks('grunt-dustjs');
    grunt.loadNpmTasks('grunt-simple-mocha');

    // Default task(s).
  grunt.registerTask('default', ['dustjs']);
  grunt.registerTask('test', ['simplemocha']);
};
