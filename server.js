import express from 'express'
import session from 'express-session';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();
const app = express();

const connect = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDb");
    }catch(error){
        throw error;
    }
}


mongoose.connection.on("disconnected", () => {
    console.log("MongoDb Disconnected");
})


// middleWare
app.use(cors({
    origin: ['https://event-management-system-frontend-liart.vercel.app', 'http://localhost:3000'], // Allow requests from this origin
    methods: 'GET,POST,PUT,DELETE', 
    credentials: true, 
}));

app.use(express.json());


const PORT = process.env.PORT || 6600;
app.listen(PORT, () => {
    connect();
    console.log(`Server Running on Port ${PORT}`);
})
