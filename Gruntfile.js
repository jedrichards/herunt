module.exports = function (grunt) {

    grunt.initConfig({
        jshint: {
            all: [
                "Gruntfile.js",
                "task/*.js",
                "<%= nodeunit.tests %>"
            ],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        clean: ["tmp"],
        herunt: {
            new: {
                src: "test/fixtures/test-app",
                dest: "tmp",
                newAppRegion: "eu"
            },
            existing: {
                src: "test/fixtures/test-app",
                dest: "tmp",
                newAppRegion: "eu"
            }
        },
        nodeunit: {
            tests: [
                "test/*-test.js"
            ]
        }
    });

    grunt.loadTasks("task");

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");
    grunt.loadNpmTasks("grunt-contrib-clean");

    grunt.registerTask("test",[
        "jshint",
        "clean",
        "herunt",
        "nodeunit",
        "clean"
    ]);
};