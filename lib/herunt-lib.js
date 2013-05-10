module.exports.parseAppNameFromHerokuInfoStdout = function (stdout) {
    stdout = stdout||"";
    return stdout.split("\n")[0].split("=== ")[1]||"unknown";
}