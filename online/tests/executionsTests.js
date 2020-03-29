import {simpleRequest as request} from "./utilities/request.js";
import fs from "fs";
import chai from "chai";
import chaiMatch from "chai-match";
chai.use(chaiMatch);
const expect = chai.expect;

function getTest(id) {
	return fs.readFileSync(`./online/tests/executions/test${id}.json`,{
		"encoding": "utf-8",
		"flag": "r"
	});
}

describe("Check that executions is working as intended",function() {
	const path = "/developer-test";
	
	function test(id,result) {
		describe(`test ${id}`,function() {
			let data = getTest(id);
			it("returns status 200",function(done) {
				request(data,path,(headers,body) => {
					expect(headers[":status"]).to.equal(200);
					done();
				});
			});
			it("returns application/json",function(done) {
				request(data,path,(headers,body) => {
					const regex = new RegExp("application/json");
					expect(headers["content-type"]).to.match(regex);
					done();
				});
			});
			it("returns valid result",function(done) {
				request(data,path,(headers,body) => {
					expect(body.result).to.equal(result);
					done();
				});
			});
		});
	}
	
	test(0,4);
	test(1,4);
	test(2,40001);
});