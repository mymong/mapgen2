const PORT = 80;
const ROOT = "./";

const fs = require('fs');
const http = require('http');
const path = require('path');

const mime = new Map([
	[".js", "application/javascript"],
	[".mjs", "application/javascript"],
	[".html", "text/html"]
])
const server = http.createServer((request, response) => {
	const source = path.join(ROOT, request.url);
	const ext = path.parse(source).ext;
	const readStream = fs.createReadStream(source);
	request.url.slice(0, 	)
	readStream.on("open", () => {
		response.setHeader("Content-Type", mime.get(ext) || "text/plain"); //Solution!
  	response.writeHead(200);
		readStream.pipe(response);
	});
	readStream.on("error", () => {
		response.statusCode = 400;
		response.end("");
	});
});

server.listen(PORT, err => {
	if (err) {
		console.log("Failed to start server", err);
	}
	else {
		console.log("Started server on port " + PORT);
	}
});