var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
var async = require("async");
var path = require("path");
var fs = require("fs");
var semver = require("semver");
var rsync = require("rsyncwrapper").rsync;
var _ = require("underscore");
var S = require("string");
var heruntLib = require("../lib/herunt-lib");

module.exports = function (grunt) {

    grunt.registerMultiTask("herunt","Deploy to Heroku",function () {

        var done = this.async();

        var app = path.resolve(this.data.app);
        var herokuRepoLocal = this.data.herokuRepo;
        var herokuRepo = path.resolve(this.data.herokuRepo);
        var region = this.data.region;
        var exclude = this.data.exclude||[];
        var config = this.data.config;
        var name = this.data.name;
        var includeModules = this.data.includeModules||[];

        app = app.charAt(app.length-1) === "/" ? app.slice(0,-1) : app;
        herokuRepo = herokuRepo.charAt(herokuRepo.length-1) === "/" ? herokuRepo.slice(0,-1) : herokuRepo;

        grunt.log.writelns("app "+app.cyan);
        grunt.log.writelns("herokuRepo "+herokuRepo.cyan);

        var subTasks = [
            checkHerokuCLIPresent,
            checkHerokuCLIVersion,
            checkHerokuCLIAuth,
            checkApp,
            checkHerokuRepo,
            checkHerokuRepoGit,
            checkHerokuApp,
            pull,
            syncAppToHerokuRepo,
            touchDeploymentInfoFile,
            addAndCommit,
            setAppConfig,
            push
        ];

        async.series(subTasks,function (err) {
            if ( err ) {
                grunt.log.error();
                grunt.log.errorlns(err);
                done(false);
            } else {
                done(true);
            }
        });

        function checkHerokuCLIPresent (cb) {
            grunt.log.write("Checking for the Heroku CLI tool ");
            exec("which heroku",function (err,stdout,stderr) {
                if ( err ) {
                    cb("Unable to invoke the Heroku CLI tool. Is it installed? "+err+" "+stdout+" "+stderr);
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
                    cb("Unable to check the Heroku CLI tool version. "+err+" "+stdout+" "+stderr);
                } else {
                    var installedVersion = stdout.split(" ")[0].split("/")[1];
                    var minVersion = "2.39.2";
                    if ( semver.gte(installedVersion,minVersion) ) {
                        grunt.log.ok();
                        cb();
                    } else {
                        grunt.log.write("NOT SUPPORTED - UPGRADE!".red+"\n");
                        cb();
                    }
                }
            });
        }

        function checkHerokuCLIAuth (cb) {
            grunt.log.write("Checking Heroku CLI tool auth status ");
            exec("cat ~/.netrc",function (err,stdout,stderr) {
                if ( err ) {
                    cb("Can't read the ~/.netrc file. Unable to determine auth status. "+err+" "+stdout+" "+stderr);
                } else {
                    if ( stdout.indexOf("code.heroku.com") > -1 ) {
                        grunt.log.ok();
                        cb();
                    } else {
                        cb("You don't appear to be authenticated. Try running 'heroku login'?");
                    }
                }
            });
        }

        function checkApp (cb) {
            grunt.log.write("Checking the app folder ");
            var isDir = grunt.file.isDir(app);
            if ( !isDir ) {
                cb("The app folder doesn't seem to be pointing at a valid location.");
                return;
            }
            var hasPackageJSON = grunt.file.exists(app+"/package.json");
            if ( !hasPackageJSON ) {
                cb("The app folder doesn't contain a package.json, is it a Node app?");
                return;
            }
            var hasProcfile = grunt.file.exists(app+"/Procfile");
            if ( !hasProcfile ) {
                cb("The app folder doesn't contain a Procfile, is it ready for Heroku deployment?");
                return;
            }
            grunt.log.ok();
            cb();
        }

        function checkHerokuRepo (cb) {
            var isDir = grunt.file.isDir(herokuRepo);
            if ( isDir ) {
                grunt.log.write("Checking the herokuRepo folder ");
            } else {
                grunt.log.write("herokuRepo folder not present, creating ");
                grunt.file.mkdir(herokuRepo);
            }
            grunt.log.ok();
            cb();
        }

        function checkHerokuRepoGit (cb) {
            exec("git rev-parse --show-toplevel",{cwd:herokuRepo},function (err,stdout,stderr) {
                if ( S(herokuRepo).trim().s!==S(stdout).trim().s ) {
                    if ( name ) {
                        grunt.log.write("herokuRepo folder isn't a Git repo, cloning "+name.cyan+" ");
                        exec("git clone git@heroku.com:"+name+".git -o heroku .",{cwd:herokuRepo},function (err,stdout,stderr) {
                            if ( err ) {
                                cb("Unable to clone the repo. "+err+" "+stdout+" "+stderr);
                            } else {
                                grunt.log.ok();
                                cb();
                            }
                        });
                    } else {
                        grunt.log.write("herokuRepo folder isn't a repo, initialising ");
                        var cmd = "git init";
                        if ( fs.readdirSync(herokuRepo).length > 0 ) cmd += "; git add .; git commit -m \"Herunt initial commit.\"";
                        exec(cmd,{cwd:herokuRepo},function (err,stdout,stderr) {
                            if ( err ) {
                                cb("Unable to init the repo. "+err+" "+stdout+" "+stderr);
                            } else {
                                grunt.log.ok();
                                cb();
                            }
                        });
                    }
                } else {
                    grunt.log.write("herokuRepo folder is a Git repo ");
                    grunt.log.ok();
                    cb();
                }
            });
        }

        function checkHerokuApp (cb) {
            var appName;
            exec("heroku info",{cwd:herokuRepo},function (err,stdout,stderr) {
                if ( err ) {
                    grunt.log.write("No Heroku app found in herokuRepo, created ");
                    var cmd = "heroku create";
                    if ( region ) cmd = cmd+" --region "+region;
                    exec(cmd,{cwd:herokuRepo},function (err,stdout,stderr) {
                        if ( err ) {
                            cb("Unable to create the Heroku app. "+err+" "+stdout+" "+stderr);
                        } else {
                            var appName = stdout.split("Creating ")[1].split("... ")[0];
                            grunt.log.write(appName.cyan+" app ");
                            grunt.log.ok();
                            cb();
                        }
                    });
                } else {
                    grunt.log.write("Found Heroku app in herokuRepo "+heruntLib.parseAppNameFromHerokuInfoStdout(stdout).cyan+" ");
                    grunt.log.ok();
                    cb();
                }
            });
        }

        function pull (cb) {
            grunt.log.write("Pulling latest app changes from Heroku, if any ");
            exec("git branch -av",{cwd:herokuRepo},function (err,stdout,stderr) {
                if ( err ) {
                    cb("Unable to determine repo status. "+err+" "+stdout+" "+stderr);
                } else {
                    if ( stdout === "" ) {
                        grunt.log.ok();
                        cb();
                    } else {
                        exec("git pull heroku master",{cwd:herokuRepo},function (err,stdout,stderr) {
                            if ( err ) {
                                cb("Can't pull from Heroku. "+err+" "+stdout+" "+stderr);
                            } else {
                                grunt.log.ok();
                                cb();
                            }
                        });
                    }
                }
            });

        }

        function syncAppToHerokuRepo (cb) {
            grunt.log.write("Syncing app files to herokuRepo ");
            var includeCompiled = [];
            var excludeCompiled = _.union(exclude, [
                ".DS_Store",
                "/node_modules/*",
                ".git",
                ".gitignore",
                ".nodemonignore",
                "npm-debug.log",
                herokuRepoLocal
            ]);
            // Add linked modules to the inclusion list
            _.each(includeModules, function (module) {
                includeCompiled.push("/node_modules/" + module);
            });
            // Run rsync between the application and repository
            rsync({
                src: app+"/",
                dest: herokuRepo,
                recursive: true,
                exclude: excludeCompiled,
                include: includeCompiled,
                args: ["--delete", "--copy-links"]
            }, function (err,stdout,stderr,cmd) {
                if ( err) {
                    cb("Unable to sync app files to herokuRepo. "+err+" "+stdout+" "+stderr);
                } else {
                    grunt.log.ok();
                    cb();
                }
            });
        }

        function touchDeploymentInfoFile (cb) {
            var now = new Date().toString();
            var user = process.env.USER || "Anon";
            var infoString = "Deployed by "+user+" at "+now+" using Herunt.";
            grunt.log.write("Touching deployment-info file to ensure a change in Git ");
            exec("touch ./deployment-info; echo \""+infoString+"\" > ./deployment-info",{cwd:herokuRepo},function (err,stdout,stderr) {
                if ( err ) {
                    cb("Unable to make the deployment string file. "+err+" "+stdout+" "+stderr);
                } else {
                    grunt.log.ok();
                    cb();
                }
            });
        }

        function addAndCommit (cb) {
            grunt.log.write("Adding and committing new files to the repo ");
            exec("git add -A; git commit -m \"Herunt deployment.\"",{cwd:herokuRepo},function (err,stdout,stderr) {
                if ( err ) {
                    cb("Unable to add and commit new files in herokuRepo. "+err+" "+stdout+" "+stderr);
                } else {
                    grunt.log.ok();
                    cb();
                }
            });
        }

        function setAppConfig (cb) {
            if ( !config ) {
                cb();
                return;
            }
            grunt.log.write("Setting app config env ");
            var cmd = "heroku config:set";
            _.each(config,function (value,key) {
                cmd += " "+key+"="+value;
            });
            exec(cmd,{cwd:herokuRepo},function (err,stdout,stderr) {
                if ( err ) {
                    cb("Unable to set app config env. "+err+" "+stdout+" "+stderr);
                } else {
                    grunt.log.ok();
                    cb();
                }
            });
        }

        function push (cb) {
            grunt.log.writelns("Deploying to Heroku ...");
            var ps = spawn("git",["push","heroku","master"],{cwd:herokuRepo});
            ps.stderr.on("data",function (data) {
                grunt.log.write(data.toString("utf8"));
            });
            ps.stdout.on("data",function (data) {
                grunt.log.write(data.toString("utf8"));
            });
            ps.on("exit",function (code) {
                if ( code > 0 ) {
                    cb("\nError pushing to Heroku git repo.");
                } else {
                    grunt.log.write("\nHerunt deployment completed ");
                    grunt.log.ok();
                    cb();
                }
            });
        }
    });
};
