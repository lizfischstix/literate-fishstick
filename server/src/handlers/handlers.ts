import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import User from "../models/User";
import Blog from "../models/Blog";
import Comment from "../models/Comment"
import { BlogType, UserType, CommentType } from "../schema/schema";
import { Document } from "mongoose";
import { hashSync, compareSync } from "bcryptjs";
import { error } from "console";
type DocumentType = Document<any, any, any>;

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
                    if (!pwvalidation) return new Error("login credentials failed");
                    return existingUser;
                } catch (err) {
                    return new Error(err)
                }
            },

        },
        // create blog
        addBlog: {
            type: BlogType,
            args: {
                title: { type: GraphQLNonNull(GraphQLString) },
                content: { type: GraphQLNonNull(GraphQLString) },
                date: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, { title, content, date }) {
                let blog: Document<any, any, any>;
                try {
                    blog = new Blog({ title, content, date });
                    return await blog.save();
                } catch (err) {
                    return new Error(err);
                }
            },
        },
        //update blog
        updateBlog: {
            type: BlogType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
                title: { type: GraphQLNonNull(GraphQLString) },
                content: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, { id, title, content }) {
                let existingBlog: DocumentType
                try {
                    existingBlog = await Blog.findById(id);
                    if (!existingBlog) return new Error("Blog not found")
                    return await Blog.findByIdAndUpdate(id, {
                        title,
                        content
                    },
                        { new: true }
                    );
                } catch (err) {
                    return new Error(err);

                }
            }
        },
        //delete blog
        deleteBlog: {
            type: BlogType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            async resolve(parent, { id }) {
                let existingBlog: DocumentType;
                try {
                    existingBlog = await Blog.findById(id);
                    if (!existingBlog) return new Error("blog not found");
                    return await Blog.findByIdAndRemove(id)
                } catch (err) {
                    return new Error(err)
                }

            }

        }
    }
});
export default new GraphQLSchema({ query: RootQuery, mutation: mutation });