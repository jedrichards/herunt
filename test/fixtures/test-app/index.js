var http = require("http");

var server = new http.Server();

server.addListener("request",function (req,res) {
    console.log([req.method,req.headers.host,req.url].join(" | "));
    res.end("<pre>Hello World</pre>");
});

server.listen(process.env.PORT||8080);