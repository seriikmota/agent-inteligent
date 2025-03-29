import * as dotenv from "dotenv";
import app from "./app";
import * as pg from "pg";
const { Pool } = pg;

dotenv.config();

const pgUser = process.env.PG_USER;
const pgPass = process.env.PG_PASS;
const pgUrl = process.env.PG_URL;
const pgDb = process.env.PG_DB;
const port = process.env.PORT;
export const connectionString = `postgresql://${pgUser}:${pgPass}@${pgUrl}/${pgDb}`

const server = app.listen(port);

server.on("listening", () => console.log(`Server running on ${port}`));
