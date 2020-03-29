/*
 * Initialize the server
 */

"use strict";

import executions from "./executions.js";
import http2 from "http2";

const server = http2.createServer();

const validResponse = {
	":status": 200,
	"content-type": "application/json; charset=uft-8"
};

server.on("stream",(stream,headers) => {
	const path = headers[":path"];
	
	let body = [];
	
	stream.on("data",(chunk) => {
		body.push(chunk.toString());
	});
	
	stream.on("end",() => {
		switch(path) {
			case "/developer-test":
				const result = executions(JSON.parse(body.join("")));
				stream.respond(validResponse);
				stream.write(JSON.stringify(result));
				break;
		}
		
		stream.end();
	});
});

server.listen(process.env.PORT,process.env.IP);