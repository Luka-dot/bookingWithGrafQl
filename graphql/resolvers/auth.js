const bcrypt = require('bcryptjs');
// using webtoken for authentication for login
const jwt = require('jsonwebtoken');
// importing schema model
const User = require('../../models/user');

module.exports = {
    createUser: async args => {
        try {
            // making sure there are no duplicate emails for different users
            const existingUser = await User.findOne({
                email: args.userInput.email
            })
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
            return {
                ...result._doc
            };
        } catch (err) {
            throw err;
        }
    },
    // name login => responds to name in schema/index.js where declaring all endpoints in grafQl
    login: async ({email, password}) => {
        // validating if email and password is correct
        const user = await User.findOne({ email: email});
        if (!user) {
            throw new Error('invalid credential u');
        }
        // compare() is bcrypt function comparing password to hashed password in database
        isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new Error('invalid credential p')
        }
        // jasonwebtoken... using string that helps has password 'somesupersecretkey'
        const token = jwt.sign({userId: (await user).id, email: user.email}, 'somesupersecretkey', {
            expiresIn: '1h'
        });
        // return corresponds with scheme in grafQl (schema/index.js)
        return { userId: user.id, token: token, tokenExpiration: 1 }
    }

};