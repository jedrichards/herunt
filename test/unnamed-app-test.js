
var exec = require("child_process").exec;
var heruntLib = require("../lib/herunt-lib");
var path = require("path");

module.exports = {
    setUp: function (cb) {
        this.tmpUnnamed = path.resolve("tmpUnnamed");
        cb();
    },
    tearDown: function (cb) {
        var dir = this.tmpUnnamed;
        exec("heroku info",{cwd:dir},function (err,stdout,stderr) {
            if ( err ) console.log(err,stdout,stderr);
            var name = heruntLib.parseAppNameFromHerokuInfoStdout(stdout);
            var cmd = "heroku destroy --app "+name+" --confirm "+name;
            console.log("\n>>>>",cmd);
            exec(cmd,{cwd:dir},function (err,stdout,stderr) {
                if ( err ) console.log(err,stdout,stderr);
                cb();
            });
        });
    },
    testUnnamedApp: function (test) {
        test.expect(1);
        exec("heroku info",{cwd:this.tmpUnnamed},function (err,stdout,stderr) {
            var name = heruntLib.parseAppNameFromHerokuInfoStdout(stdout);
            test.equals(name.split("-").length,3,"Name should split into three parts");
            test.done();
        });
    }
};