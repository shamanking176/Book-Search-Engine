const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
     if (context.user){
        const userdata = await User.findOne({_id:context.user._id}).select('-___v -password')
        return userdata;
     }
     throw new AuthenticationError('not loggedin')
    },
    
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      console.log("User login",user)
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, {description},context) => {
      if (context.user) {
        const book = await Book.create({
          description,
         user: context.user.username,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { books: book._id } }
        );

        return thought;

  }
},
}
};

module.exports = resolvers;
