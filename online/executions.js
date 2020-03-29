/*
 * execute requests on /developer-test/enter-path
 * 
 * the input is the objet sent in post request
 * 
 * the output is an object with the property "result" set to the result
 */

"use strict";

import Point from "./classes/Point.class.js";
import {insertReport} from "./db.js";
import {performance} from "perf_hooks";

export default (request) => {
	const startTime = performance.now();

	const commands = request.commands;
	let current = new Point(request.start.x,request.start.y);
	const filled = [];
	let result = 0;

	for(let command of commands) {
		let start,end;
		const steps = command.steps;
		switch(command.direction) {
			case "north":
				start = current;
				end = new Point(current.x,current.y + steps);
				current = end;
				break;
			case "east":
				start = current;
				end = new Point(current.x + steps,current.y);
				current = end;
				break;
			case "south":
				start = new Point(current.x,current.y - steps);
				end = current;
				current = start;
				break;
			case "west":
				start = new Point(current.x - steps,current.y);
				end = current;
				current = start;
				break;
		}

		let axis,pAxis;
		switch(command.direction) {
			case "north":
			case "south":
				axis = "y";
				pAxis = "x";
				break;
			case "east":
			case "west":
				axis = "x";
				pAxis = "y";
				break;
		}

		const m = [];
		for(let k = 0;k <= end[axis]-start[axis];k++) {
			m.push(1);
		}

		for(let e of filled) {
			if(e.start[pAxis] === e.end[pAxis]) {
				if(e.start[pAxis] === start[pAxis] && e.start[axis] <= end[axis] && e.end[axis] >= start[axis]) {
					const min = Math.max(start[axis],e.start[axis])-start[axis];
					const max = Math.min(end[axis],e.end[axis])-start[axis];
					for(let k = min;k <= max;k++) {
						m[k] = 0;
					}
				}
			} else {
				if(start[axis] <= e.start[axis] && end[axis] >= e.start[axis] && e.start[pAxis] <= start[pAxis] && e.end[pAxis] >= start[pAxis]) {
					m[e.start[axis]-start[axis]] = 0;
				}
			}
		}
		filled.push({start: start,end: end});

		let count = 0;
		for(let e of m) {
			count += e;
		}
		result += count;
	}

	const endTime = performance.now();

	insertReport(commands.length,result,(endTime - startTime) / 1000.0);

	return {result: result};
};