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
        clean: ["tmpUnnamed","tmpNamed"],
        herunt: {
            newNamed: {
                app: "test/fixtures/test-app",
                herokuRepo: "tmpNamed",
                name: "herunt-test-app"
            },
            existingNamed: {
                app: "test/fixtures/test-app",
                herokuRepo: "tmpNamed",
                name: "herunt-test-app"
            },
            newUnnamed: {
                app: "test/fixtures/test-app",
                herokuRepo: "tmpUnnamed",
                region: "eu",
                config: {
                    NODE_ENV: "production",
                    DB_USER: "foo",
                    DB_PASS: "bar",
                    API_KEY: "baz"
                }
            },
            existingUnnamed: {
                app: "test/fixtures/test-app",
                herokuRepo: "tmpUnnamed"
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