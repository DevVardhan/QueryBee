import {Pool} from "pg";
import * as dotenv from "dotenv" ; 

dotenv.config(); 
const pool = new Pool({
    host: process.env.SUPABASE_HOST,
    port: Number(process.env.SUPABASE_PORT),
    user: process.env.SUPABASE_USER,
    password: process.env.SUPABASE_PASSWORD,
    database: process.env.SUPABASE_DATABASE,
    ssl: { rejectUnauthorized: false }
});



export default pool ; 