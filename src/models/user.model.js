import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // it is Bearer token for the client side authentication endpoint and   will  one who has token can access data thatis it is like key for user
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // always make this true for optimized searching
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "fullName is required"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // clouinary url will be stored here
      required: [true, "Avatar is required"],
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId, // we have imported shcmea else mongoose.Schema.Types.ObjectId
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
)

userSchema.pre("save", async function (next) {
  // Check if the password field has been modified
  if (!this.isModified("password")) return next(); // If not modified, proceed to the next middleware

  // Hash the password using bcrypt with a salt of 10 rounds
  this.password = await bcrypt.hashSync(this.password, 10);

  next(); // Proceed to the next middleware
  // Note: If the condition is removed, the password will be hashed every time the document is saved
  //  callback function is called hook
})

// 'methods' is a property of Mongoose schemas used to define custom instance methods
// 'ispasswordCorrect' is a custom method added to the userSchema to check if a provided password is correct
// This method will be available on user instances and can be called like: user.ispasswordCorrect(password)

userSchema.methods.isPasswordCorrect = async function (password) {
  // Compare the provided password with the hashed password stored in the current user document
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken =  function () {
  // Generate a JSON Web Token (JWT) containing user information
  // Sign the token with the ACCESS_TOKEN_SECRET environment variable
  // Set the expiration time for the token based on the ACCESS_TOKEN_EXPIRY environment variable

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken =  function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
}

// userSchema.pre("save", (next)=>{   this will not work becuase in js arrow function has no access to this keyword that is it will not be ablr to acces
//   //your code
//   next()
// })

export const User = mongoose.model("User", userSchema);







// -----------------------------------DEFINATION-------------------------------------

//   ALL THE METHODS CREATED ABOVE LIKE sign , isPasswordCorrect, generateRefreshToken, generateAccessToken
//  are defined in userSchema and can be used only what we   get through User model from our DATABASE i.e  MONGODB 
// thse can be used on ---"User"---- bcz it is creted by moongoose


/*-----------------------------------------JWTSIGN------------------------------------------------*/

/*
The jwt.sign() function is part of the JSON Web Token (JWT) library and is used to generate a JWT token based on the provided payload, secret key, and options. Here's an explanation of its parameters:

Payload: This is the data that you want to include in the token. It can be any valid JSON object containing the user's identity or any other relevant information.

Secret Key: This is a secret cryptographic key used to sign the token. It should be kept confidential and never shared publicly. The secret key is used to verify the authenticity of the token later during the verification process.

Options: These are optional parameters that can customize the behavior of the token generation process. Some common options include:

expiresIn: Specifies the expiration time of the token, after which it becomes invalid.
notBefore: Specifies the time before which the token should not be considered valid.
audience: Specifies the intended audience for the token.
issuer: Specifies the issuer of the token.
subject: Specifies the subject of the token.
The jwt.sign() function returns a JWT token as a string, which can then be used for authentication and authorization purposes.
 */