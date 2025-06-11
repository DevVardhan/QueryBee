import pool from "./pool.js";

const getDatabaseSchema = async () => {
  try {
    const query =`SELECT 
        table_schema,
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'ecommerce_core'
      ORDER BY table_name, ordinal_position;
    `;

    const res = await pool.query(query);
    
    // Format results
    const schema = {};
    res.rows.forEach(row => {
      const key = `${row.table_schema}.${row.table_name}`;
      if (!schema[key]) {
        schema[key] = [];
      }
      schema[key].push({ column: row.column_name, type: row.data_type });
    });

    return schema;

  } catch (err) {
    console.error("Error fetching schema:", err);
  }
};


const executeGeneratedQuery = async(sql)=>{
    console.log(sql);
 const client = await pool.connect();
    try {
        const result = await client.query(sql);
        console.log( "============ QUERRY ================")
        console.log(result.rows);
        console.log( "============ QUERRY ================")
        return result.rows; // defind
    }catch(err){
        console.log(`err : ${err}`);
    } finally {
        client.release();
    } 
}
const features = {
    getDatabaseSchema ,
    executeGeneratedQuery ,
};

export default features ; 