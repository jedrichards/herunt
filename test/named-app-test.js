var exec = require("child_process").exec;
var heruntLib = require("../lib/herunt-lib");
var path = require("path");

module.exports = {
    setUp: function (cb) {
        this.tmpNamed = path.resolve("tmpNamed");
        cb();
    },
    tearDown: function (cb) {
        cb();
    },
    testNamedApp: function (test) {
        test.expect(1);
        exec("heroku info",{cwd:this.tmpNamed},function (err,stdout,stderr) {
            var name = heruntLib.parseAppNameFromHerokuInfoStdout(stdout);
            test.equals(name,"herunt-test-app","Name should be herunt-test-app");
            test.done();
        });
    }
};