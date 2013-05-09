## Herunt

### A Grunt plugin for deploying Node.JS apps to Heroku

You can use Herunt to automate both setting up and deploying a Node.JS app to Heroku from your Grunt-based build process.

Herunt takes the view that since the code you're deploying to Heroku is probably in some way derived (optimised, concantenated, compiled, whatever) it probably doesn't make much sense to be committing it to your main source code repo. So the idea with Herunt's approach is that once you have your app nicely built and ready for deployment it should committed to a repo the sole purpose of which is to store the revisions of the compiled app and push to Heroku.

Herunt will automate the following:

- Setting up the deployment Git repo (only on first run)
- Creating the Heroku app (only on first run)
- Copying, adding and committing your built app files into the repo
- Setting env config vars on the Heroku app
- Deploying the app to Heroku