import express from "express" ; 
import Morgan from "morgan" ; 
import * as dotenv from 'dotenv';
import quertRouter from './routes/queryRoute.js'
const app = express();
dotenv.config();


app.use(express.json());


// logs requests 
if(process.env.NODE_ENV === `dev`){
    app.use(Morgan('dev'));
};

// append creation date
app.use((req , res , next)=>{
    const date  = new Date();
    req.CreatedAt = date.toDateString() ;
    next();
});

// Routes
app.use('/api/v1', quertRouter); 

export default app ; 