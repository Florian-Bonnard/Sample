/*
 * utility to manage building HTTP/2 requests for tests
 */

import http2 from "http2";

function build() {
	return http2.connect(`http://${process.env.IP}:${process.env.PORT}`);
}

function request(session,data = "",path = "/",callback = (headers,body) => {}) {
	const r = session.request({
		":method": "POST",
		":path": path,
		"content-type": "application/json; charset=uft-8",
		"content-length": data.length,
		"accept": "application/json"
	});
	
	let body = [];
	
	r.on("response",(headers) => {
		r.on("data",(chunk) => {
			body.push(chunk.toString());
		});
		r.on("end",() => {
			callback(headers,JSON.parse(body.join("")));
		});
	});
	
	r.on("error",(e) => {
		if(process.env.DEBUG) {
			console.log(e);
		}
		process.exit(3);
	});
	
	r.write(data);
	r.end();
}

function destroy(session) {
	session.setTimeout(5000,() => {
		session.close();
	});
}

function simpleRequest(data,path,callback) {
	const session = build();
	request(session,data,path,callback);
	destroy(session);
}

export {build,request,destroy,simpleRequest};
