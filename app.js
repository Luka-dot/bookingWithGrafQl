const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');  // graphqlHttp is a function. Can be used where express expects middleware func
const { buildSchema } = require('graphql'); // object dest. Takes string and stor values in to buildSchema. schema is build as a string
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// importing schema model
const Event = require('./models/event');
const User = require('./models/user');

// creating express app object by calling express() to be able to start node server 
const app = express()
// this global variable is temporally. will use database later
const events = [];

// middleware to parse incoming json bodies
app.use(bodyParser.json());

// passing configure in {} inside graphqlHttp, points to schema and resolvers
// type key word - defines what certain end-points return. Then tied them to schema
/* Event: ! so it can not be null. using  _id since MongoDB using the same
/* RootQuery: ! inside [] ensure array wont be null. ! outside ensure return wont be null  returns array of Events */
/* RootMutation: expected value 'name' type is string and returns Event we just created */
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    // rootValue = all resolver. 
    rootValue: {
        events: () => {
            return Event.find()    // need return so grafQl  express know this is async opp and waits for it to complete
                .then(events => {
                    // for each event ran: _doc is a property provided by Mongoose. gives {} all properties without metadata
                    return events.map(event => {
                        return { ...event._doc };
                    });
                })
                .catch(err => {
                    throw err
            });
        },
        // passing argument = args  since 'buildSchema' for this 'type' expects argument 
        createEvent: (args) => {
                                        // this logic should follow what was set up in grafQl schema
                                        // const event = {
                                        //     _id: Math.random().toString(),
                                        //     // eventInput was used to create event. eventInput returns event inside another {} therefor args.eventInput.title has to
                                        //     //be used instead just args.title
                                        //     title: args.eventInput.title,
                                        //     description: args.eventInput.description,
                                        //     price: +args.eventInput.price,  // + make sure whatever argument was passed will be converted to number
                                        //     date: new Date().toISOString()  // toISOString since we defined date to be string
                                        // };
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,  // + make sure whatever argument was passed will be converted to number
                date: new Date(args.eventInput.date),   // args.***.date is a string. using new Date constructor to convert to date
                creator: '5e741b3b3a26d65f68175a0c'
            });
            let createdEvent;
            return event   // need return so grafQl  express know this is async opp and waits for it to complete
                .save()
                .then(result => {
                    createdEvent = { ...result._doc };
                    return User.findById('5e741b3b3a26d65f68175a0c')
                    
                    // _doc is a property provided by Mongoose. gives {} all properties without metadata
                    
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found.')
                    }
                    user.createdEvents.push(event);
                    return user.save();
                })
                .then(result => {
                    return createdEvent;
                })
                .catch(err => {
                console.log(err);
                throw err;
            });
        },
        createUser: args => {
            // making sure there are no duplicate emails for different users
            return User.findOne({email: args.userInput.email})
                .then(user => {
                    if (user) {
                        throw new Error('User with this email address already exists')
                    }
                    // using bcrypt package to protect passwords in database. That is Async process. therefore need return
                    return bcrypt.hash(args.userInput.password, 12)
                })                              
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,       
                        password: hashedPassword
                    });
                    return user.save();
                })
                .then(result => {
                    // for each event ran: _doc is a property provided by Mongoose. gives {} all properties without metadata
                    return { ...result._doc };
                })
                .catch(err => {
                   throw err
               });
            
        }
    },
    graphiql: true
    })
);
// nodemon.json is set up with username and password. passing those variables to connection to mongoose and starting server
               //  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-cpkkj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-9lijc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,{useUnifiedTopology: true}).then(() => {
                        app.listen(3000);
                    }).catch(err => { 
                        console.log('logging error in connect ',err);
                    });
                    


// mongoDB atlas  lukas-user pass: jQjyBDMNMuVFDcLJ     Coding79

// using nodemon to have server restarting on change. package.json modified 
// added   "start": "nodemon app.js"

/*

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-9lijc.mongodb.net/test?retryWrites=true&w=majority`).then(() => {
                        app.listen(3000);
                    }).catch(err => { 
                        console.log('logging error in connect ',err);
                    });

*/