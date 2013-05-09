## Herunt

### A Grunt multitask plugin for deploying Node.JS apps to Heroku

You can use Herunt to automate both setting up and deploying a Node.JS app to Heroku from your Grunt-based build process.

Herunt takes the view that since the code you're deploying to Heroku is probably in some way derived (optimised, concantenated, compiled, whatever) it probably doesn't make much sense to be committing it to your main source code repo. So the idea with Herunt's approach is that once you have your app nicely built and ready for deployment it should be committed to a separate repo the sole purpose of which is to store the revisions of the compiled app and push to Heroku.

Herunt will automate the following:

- Setting up the deployment Git repo (only on first run)
- Create the Heroku app (if required)
- Copying, adding and committing your built app files into the repo
- Setting env config vars on the Heroku app
- Deploying the app to Heroku

#### Installation

This plugin requires Grunt `~0.4.1`.

Install the plugin alongside the rest of your Grunt build process files:

    $ npm install grunt-contrib-requirejs --save-dev

And then load it into your Gruntfile.js

    ```js
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    ```