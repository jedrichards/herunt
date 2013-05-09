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
                srcDir: "test/fixtures/test-app",
                appDir: "tmp",
                region: "eu",
                appConfig: {
                    NODE_ENV: "production",
                    DB_USER: "foo",
                    DB_PASS: "bar",
                    API_KEY: "baz"
                }
            },
            existing: {
                srcDir: "test/fixtures/test-app",
                appDir: "tmp",
                region: "eu"
            }
        },
        nodeunit: {
            tests: [
                "test/*-test.js"
            ]
        }
    });

    grunt.loadTasks("tasks");

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