import { log } from "console";
import { connect } from "mongoose";
export const connectToDB = async()=>{
    try{
        await connect(`mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.o3lwi73.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    }catch (err){
        console.log(err);
        return err;
    }
};