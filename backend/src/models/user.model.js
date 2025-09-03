import mongoose from "mongoose";

const userSchema=new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullname: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilepic: {
            type: String,
        },
    },
    {timestamps: true}
);

const user = mongoose.model("User", userSchema);

export default user;