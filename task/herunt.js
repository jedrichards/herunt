var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
var async = require("async");
var path = require("path");
var semver = require("semver");

module.exports = function (grunt) {

    grunt.registerMultiTask("herunt","Deploy to Heroku",function () {

        //grunt.config.requires("src","dest");

        var done = this.async();
        var src = path.resolve(this.data.src);
        var dest = path.resolve(this.data.dest);

        var initialTasks = [
            checkHerokuCLIPresent,
            checkHerokuCLIVersion,
            checkHerokuCLIAuth,
            checkSrc,
            checkDest,
            checkDestGit
        ];

        async.series(initialTasks,function (err) {
            if ( err ) {
                grunt.log.error();
                grunt.log.errorlns(err);
                done(false);
            } else {
                done(true);
            }
        });



        // var done = this.async();
        // var options = grunt.config.get("herunt")[target];
        // var src = path.resolve(options.src);
        // var now = new Date().toString();
        // var user = process.env.USER || "Anon";
        // var infoString = "Deployed by "+user+" at "+now;

        // grunt.log.writeln("Deploying Heroku app at "+src);

        // var commands = [
        //     {
        //         description: "> Refreshing deployment-info",
        //         type: "exec",
        //         cmd: "touch ./deployment-info; echo \""+infoString+"\" > ./deployment-info"

        //     },
        //     {
        //         description: "> Tidying up and committing to repo",
        //         type: "exec",
        //         cmd: "git add -A; git commit -m \"Heroku deployment.\""
        //     },
        //     {
        //         description: "> Pushing to Heroku",
        //         type: "spawn",
        //         cmd: "git",
        //         args: ["push","heroku","master"]
        //     }
        // ];

        // var funcs = [];

        // commands.forEach(function (command) {
        //     funcs.push(function (cb) {
        //         grunt.log.writeln(command.description.grey);
        //         if ( command.type === "exec" ) {
        //             exec(command.cmd,{cwd:src},function (err,stdout,stderr) {
        //                 if ( err ) {
        //                     grunt.log.write(stderr.toString());
        //                     cb(err);
        //                 } else {
        //                     grunt.log.write(stdout.toString());
        //                     cb();
        //                 }
        //             });
        //         } else {
        //             var process = spawn(command.cmd,command.args,{cwd:src});
        //             process.stderr.on("data",function (data) {
        //                 grunt.log.write(data.toString("utf8"));
        //             });
        //             process.stdout.on("data",function (data) {
        //                 grunt.log.write(data.toString("utf8"));
        //             });
        //             process.on("exit",function (code) {
        //                 if ( code > 0 ) {
        //                     cb(true);
        //                 } else {
        //                     cb();
        //                 }
        //             });
        //         }
        //     });
        // });

        // async.series(funcs,function (err,res) {
        //     if ( err ) {
        //         done(false);
        //     } else {
        //         done(true);
        //     }
        // });

        function checkHerokuCLIPresent (cb) {
            grunt.log.write("Checking for the Heroku CLI tool ");
            exec("which heroku",function (err,stdout,stderr) {
                if ( err ) {
                    cb("Unable to invoke the Heroku CLI tool. Is it installed?");
                } else {
                    grunt.log.ok();
                    cb();
                }
            });
        }

        function checkHerokuCLIVersion (cb) {
            grunt.log.write("Checking Heroku CLI tool version ");
            exec("heroku --version",function (err,stdout,stderr) {
                if ( err || !stdout || stdout === "" ) {
                    cb("Unable to check the Heroku CLI tool version.");
                } else {
                    var installedVersion = stdout.split(" ")[0].split("/")[1];
                    var minVersion = "2.39.2";
                    if ( semver.gte(installedVersion,minVersion) ) {
                        grunt.log.ok();
                        cb();
                    } else {
                        cb("The installed Heroku CLI tool is out of date. Version "+minVersion+" and above is required.");
                    }
                }
            });
        }

        function checkHerokuCLIAuth (cb) {
            grunt.log.write("Checking Heroku CLI auth status ");
            exec("cat ~/.netrc",function (err,stdout,stderr) {
                if ( err ) {
                    cb("Can't read the ~/.netrc file. Unable to determine auth status.");
                } else {
                    if ( stdout.indexOf("code.heroku.com") > -1 ) {
                        grunt.log.ok();
                        cb();
                    } else {
                        cb("You don't appear to be authenticated. Try running 'heroku login'.");
                    }
                }
            });
        }

        function checkSrc (cb) {
            grunt.log.write("Checking the src folder ");
            var isDir = grunt.file.isDir(src);
            if ( !isDir ) {
                cb("The src folder doesn't seem to be pointing at a valid location.");
                return;
            }
            var hasPackageJSON = grunt.file.exists(src+"/package.json");
            if ( !hasPackageJSON ) {
                cb("The src folder doesn't contain a package.json, is it a Node app?");
                return;
            }
            var hasProcfile = grunt.file.exists(src+"/Procfile");
            if ( !hasProcfile ) {
                cb("The src folder doesn't contain a Procile, is it ready for Heroku deployment?");
                return;
            }
            grunt.log.ok();
            cb();
        }

        function checkDest (cb) {
            var isDir = grunt.file.isDir(dest);
            if ( isDir ) {
                grunt.log.write("Checking the dest folder ");
                grunt.log.ok();
                cb();
            } else {
                grunt.log.write("Dest folder not present, creating ");
                grunt.file.mkdir(dest);
                grunt.log.ok();
                cb();
            }
        }

        function checkDestGit (cb) {
            grunt.log.write("Checking if the dest folder is a Git repo ");
            exec("git rev-parse",{cwd:dest},function (err,stdout,stderr) {
                console.log(err,stdout,stderr);
            });
        }
    });
};
