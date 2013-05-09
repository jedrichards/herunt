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
        test.equals(this.foo,"bar");
        test.done();
    }
};