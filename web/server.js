import app from "./app.js";
import {Pool} from "pg";
const PORT = 5122;

// PostgreSQL connection pool for Supabase
// integrate pool
const connectDb = ()=> {
    const pool = new Pool({
        host: process.env.SUPABASE_HOST,
        port: process.env.SUPABASE_PORT,
        user: process.env.SUPABASE_USER,
        password: process.env.SUPABASE_PASSWORD,
        database: process.env.SUPABASE_DATABASE,
        ssl: { rejectUnauthorized: false }
    });
};

app.listen(PORT, () => {
    try{
        connectDb() ;
        console.log(`Server running at http://localhost:${PORT}`);
    }catch(err){
        console.log(err);
    }
});
