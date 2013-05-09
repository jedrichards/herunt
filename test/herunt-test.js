var exec = require("child_process").exec;

module.exports = {
    setUp: function (cb) {
        this.foo = "bar";
        cb();
    },
    tearDown: function (cb) {
        exec("heroku info",{cwd:"tmp"},function (err,stdout,stderr) {
            if ( err ) {
                console.log(stderr);
                cb();
                return;
            }
            stdout = stdout||"";
            var appName = stdout.split("\n")[0].split("=== ")[1]||"[unknown app]";
            exec("heroku destroy --app "+appName+" --confirm "+appName,{cwd:"tmp"},function (err,stdout,stderr) {
                if ( err ) {
                    console.log(stderr);
                    cb();
                    return;
                }
                cb();
            });
        });
    },
    test1: function (test) {
        // Test tmp is a git repo root?
        // Test tmp contains a Heroku app?
        // Test there are two releases?
        // Test the Herunt functions to get app name etc work?
        test.equals(this.foo,"bar");
        test.done();
    }
};