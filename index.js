const express = require("express");

const { graphqlHTTP } = require("express-graphql");
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLSchema } = require("graphql");

const app = express();
const UserType = new GraphQLObjectType({
    name: "UserType",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString},
    })
});

const RootQuery = new GraphQLObjectType({
    name: "RootQuery",
    //get all users
    fields: {
        users: {
            type: new GraphQLList(UserType),
            resolve() {
                return usersList;
            },
        },
        //get one user by ID
        user: {
            type: UserType,
            args: { id: { type:  GraphQLID } },
            resolve(parent, args) {
                return usersList.find((user) => user.id === args.id);
            },
        },
    },
});

const schema = new GraphQLSchema({ query: RootQuery });

app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));

app.listen(5000, () => console.log("Server Running on port 5000"));