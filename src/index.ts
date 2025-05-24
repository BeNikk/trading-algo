import express, { Request, Response } from 'express';
import cors from 'cors';
import orderBook from "./routes/orderBook";

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

app.get('/test',(req:Request,res:Response)=>{
    res.json({message:"Test route running"});
})

app.use("/",orderBook);

app.listen(PORT,()=>{
    console.log(`App running on PORT ${PORT}`)
})