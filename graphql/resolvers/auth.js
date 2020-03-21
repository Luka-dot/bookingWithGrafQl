const bcrypt = require('bcryptjs');
// importing schema model
const User = require('../../models/user');

module.exports = {   
    createUser: async args => {
        try {
        // making sure there are no duplicate emails for different users
        const existingUser = await User.findOne({email: args.userInput.email})
                if (existingUser) {
                    throw new Error('User with this email address already exists')
                }
                // using bcrypt package to protect passwords in database. That is Async process. therefore need return
                const hashedPassword = await bcrypt.hash(args.userInput.password, 12)                           
                const user = new User({
                    email: args.userInput.email,       
                    password: hashedPassword
                });
                const result = await user.save();
                // for each event ran: _doc is a property provided by Mongoose. gives {} all properties without metadata
                return { ...result._doc };
            } catch (err) {
               throw err;
           }
        },
};