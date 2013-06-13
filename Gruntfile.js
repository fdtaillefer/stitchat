module.exports = function(grunt) {
    // Do grunt-related things in here
    grunt.initConfig({
        dustjs: {
            compile: {
                files : {
                    "js/app/templates.js": ["tpl/*.dust"]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-dustjs');

    // Default task(s).
  grunt.registerTask('default', ['dustjs']);
};
