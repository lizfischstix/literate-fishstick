import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import User from "../models/User";
import Blog from "../models/Blog";
import Comment from "../models/Comment"
import { BlogType, UserType, CommentType } from "../schema/schema";
import { Document } from "mongoose";
import { hashSync, compareSync } from "bcryptjs";

const RootQuery = new GraphQLObjectType({
    name: "RootQuery",
    fields: {
        //get all users
        users: {
            type: GraphQLList(UserType),
            async resolve() {
                return await User.find();
            }
        },
        //get all blogs
        blogs: {
            type: GraphQLList(BlogType),
            async resolve() {
                return await Blog.find();
            },
        },
        //get all comments
        Comments: {
            type: GraphQLList(CommentType),
            async resolve() {
                return await Comment.find();
            }
        }

    }

});

const mutation = new GraphQLObjectType({
    name: "mutation",
    fields: {
        //new user signup
        signup: {
            type: UserType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, { name, email, password }) {
                let existingUser: Document<any, any, any>;
                try {
                    existingUser = await User.findOne({ email });
                    if (existingUser) return new Error("user already exists");
                    const encryptedPW = hashSync(password);
                    const user = new User({ name, email, password: encryptedPW });
                    return await user.save();
                } catch (err) {
                    return new Error("User Signup Failed")
                }
            },
        },
        //user login
        login: {
            type: UserType,
            args: {
                email: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, { email, password }) {
                let existingUser: Document<any, any, any>;
                try {
                    existingUser = await User.findOne({ email });
                    if (!existingUser)
                        return new Error("login credentials failed");
                    const pwvalidation = compareSync(
                        password,
                        // @ts-ignore
                        existingUser?.password
                    ); 
                    if(!pwvalidation) return new Error("login credentials failed");
                    return existingUser;
                } catch (err) {
                    return new Error(err)

                }
            },
        }
    }
});
export default new GraphQLSchema({ query: RootQuery, mutation: mutation });