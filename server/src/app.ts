import express from "express";
import { config } from "dotenv";
import { connectToDB } from "./utils/connection";
import { graphqlHTTP } from "express-graphql";
import schema from "./handlers/handlers";

config();

const app = express();

app.use("/graphql", graphqlHTTP({ schema: schema, graphiql:true }))
connectToDB()
.then(() => {
    app.listen(process.env.PORT, () =>
        console.log(`Server running on Port ${process.env.PORT}`)
    );
})
.catch(err=>console.log(err));
