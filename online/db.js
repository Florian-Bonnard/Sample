/*
 * managing the startup of the db and the export of some utilities for core functions of the server
 */

"use strict";

import dotenv from "dotenv";
import pg from "pg";
const Pool = pg.Pool;

dotenv.config();

let pool;

async function startDB(db_host,db_port,db_name,username,password) {
	pool = new Pool({host: db_host,port: db_port,database: db_name,user: username,password: password,max: 10});
	let retries = process.env.DB_RETRIES;
	while(retries) {
		try {
			await pool.query(
				`DO
					$$ BEGIN
						IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'test') THEN
							CREATE SCHEMA test;
							SET search_path TO test,public;
							CREATE TABLE executions(id SERIAL PRIMARY KEY,timestamp TIMESTAMPTZ NOT NULL,commands INTEGER NOT NULL CHECK(0 <= commands AND commands <= 10000),result INTEGER NOT NULL CHECK(0 <= result AND result <= 100000*commands),duration REAL NOT NULL CHECK(0 <= duration));
							CREATE FUNCTION update_timestamp() RETURNS TRIGGER AS $update_timestamp_scope$ BEGIN NEW.timestamp = now(); RETURN NEW; END; $update_timestamp_scope$ LANGUAGE plpgsql;
							CREATE TRIGGER update_timestamp_executions BEFORE INSERT OR UPDATE ON executions FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
							CREATE FUNCTION insert_report(executions.commands%TYPE,executions.result%TYPE,executions.duration%TYPE) RETURNS VOID AS $insert_report_scope$ BEGIN INSERT INTO test.executions VALUES(DEFAULT,NULL,$1,$2,$3); END; $insert_report_scope$ LANGUAGE plpgsql;
							SET search_path TO public;
						END IF;
					END; $$`
			);
		} catch(e) {
			retries -= 1;
			if(process.env.DEBUG) {
				console.log(e);
				console.log(`retries left: ${retries}`);
			}
			await new Promise((resolve,reject) => setTimeout(resolve,5000,0));
		}
	}
	process.exit(1);
}

startDB(process.env.DB_HOST,process.env.DB_PORT,process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASS);

async function insertReport(commands,result,duration) {
	const query = "SELECT test.insert_report($1,$2,$3)";
	const values = [commands,result,duration];
	try {
		await pool.query(query,values);
	} catch(e) {
		if(process.env.DEBUG) {
			console.log(e);
		}
		process.exit(1);
	}
}

export {insertReport};
