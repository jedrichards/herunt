## Herunt

### A Grunt multitask plugin for deploying Node.JS apps to Heroku

***

You can use Herunt to automate both setting up and deploying a Node.JS app to Heroku from your Grunt-based build process.

Herunt takes the view that since the code you're deploying to Heroku is probably in some way derived (optimised, concatenated, compiled, whatever) it probably doesn't make much sense to be committing it to your main source code repo. So the idea with Herunt's approach is that once you have your app nicely built and ready for deployment it should be committed to a separate repo the sole purpose of which is to store the compiled app package and push it to Heroku.

Herunt will automate:

- Set up the deployment Git repo if required on first run
- Create a brand new Heroku app if required, or work with an existing app
- Copy, add and commit your built app files into the repo
- Add/set env config vars on the Heroku app
- Deploy the app to Heroku

#### Installation

Install the plugin alongside the rest of your Grunt build process files:

```shell
$ npm install herunt --save-dev
```

And then reference it in your `Gruntfile.js`:

```javascript
grunt.loadNpmTasks("herunt");
```

#### Prerequisites

This plugin requires Grunt `~0.4.1`.

The [Heroku Toolbelt](https://toolbelt.herokuapp.com) CLI tool needs to be installed, available in your `PATH` and authenticated. Version `>=2.39.2` is required.

You need a modern version of Git `>=1.8` installed and available in your `PATH` too.

Herunt has been tested on OSX only. It'll probably work on various flavours of *nix, but Windows not so much.

#### Configuration

```javascript
grunt.initConfig({
    herunt: {
        deploy: {
            app: "dist",
            herokuRepo: "heroku-app",
            name: "sleepy-anchorage-3191",
            region: "eu",
            config: {
                NODE_ENV: "production",
                DB_USER: "foo",
                DB_PASS: "bar",
                API_KEY: "baz"
            },
            exclude: ["scss,"*.foo"]
        }
    }
});
```javascript

Bleh `app` This is the path (relative to the `Gruntfile.js`) that contains your derived app ready to be deployed to Heroku. This isn't the Heroku-enabled Git repo. By the time Herunt gets to looking at this folder it should have been populated by your build process with the compiled, compressed and concatendated files that comprise your production-ready app.

`herokuRepo` This is the desired location of the Heroku Git repo, i.e. the repo which simply stores and pushes the derived app. If this folder doesn't exist Herunt will create it and set up the repo automatically. If you intend to keep this repo inside the work tree of your main project repo you must add its containing folder to `.gitignore` or else bad things will happen.

`name` Optional. The name of the Heroku app. This field is optional since Herunt will create a new app on Heroku if you don't specify it. Either the named app, or the automatically created app will be picked up on subsequent runs.

`region` Optional. Defaults to US, but feel free to use the value `eu` to target the new Heroku Europe cluster.

`config` Optional. Hash of name/value pairs for any env vars you want to set on the Heroku app.

`exclude` Optional. Array of exclude patterns to use when Herunt copies the contents of the `app` folder into the `herokuRepo`. Herunt automatically excludes the following `".DS_Store","node_modules",".git",".gitignore",".nodemonignore","npm-debug.log"`.