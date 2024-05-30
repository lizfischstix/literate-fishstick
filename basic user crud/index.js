const express = require("express");

const { graphqlHTTP } = require("express-graphql");
const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList, GraphQLSchema } = require("graphql");

const app = express();

let usersList = [
    { id: "1", name: "Zak", email: "zak@email.com" },
    { id: "2", name: "Amelia", email: "amelia@email.com" },
    { id: "3", name: "Archer", email: "archer@email.com" },
];

const UserType = new GraphQLObjectType({
    name: "UserType",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
    }),
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
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return usersList.find((user) => user.id === args.id);
            },
        },
    },
});
const mutations = new GraphQLObjectType({
    name: "mutations",
    fields: {
        //add user
        addUser: {
            type: UserType,
            args: { name: { type: GraphQLString }, email: { type: GraphQLString } },
            resolve(parent, { name, email }) {
                const newUser = { name, email, id: Date.now().toString() };
                usersList.push(newUser);
                return newUser;
            },
        },
        //update user
        updateUser: {
            type: UserType,
            args: {
                id: { type: GraphQLID }, 
                name: { type: GraphQLString }, 
                email: { type: GraphQLString },
            },
            resolve(parent, { id, name, email }) {
                const user = usersList.find((u) => u.id === id);
                user.email = email;
                user.name = name;
                return user;
            },
        },
        //delete user
        deleteUser: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
            },
            resolve(parent, { id }) {
                const user = usersList.find((u) => u.id === id);
                usersList = usersList.filter((u) => u.id !== id);
                return user;
            },
        },
    }
})

const schema = new GraphQLSchema({ query: RootQuery, mutation: mutations });

app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));

app.listen(5000, () => console.log("Server Running on port 5000"));