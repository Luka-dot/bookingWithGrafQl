const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');  // graphqlHttp is a function. Can be used where express expects middleware func
//const { buildSchema } = require('graphql'); // object dest. Takes string and stor values in to buildSchema. schema is build as a string
const mongoose = require('mongoose');
const isAuth = require('./middleware/is-auth');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

// creating express app object by calling express() to be able to start node server 
const app = express()

// middleware to parse incoming json bodies
app.use(bodyParser.json());

// middleware check for authentication. this will run on every request and give true/false for token auth
app.use(isAuth);

app.use('/graphql', graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
    })
);

// nodemon.json is set up with username and password. passing those variables to connection to mongoose and starting server
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-9lijc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,{useUnifiedTopology: true}).then(() => {
                        app.listen(3000);
                    }).catch(err => { 
                        console.log('logging error in connect ',err);
                    });

// using nodemon to have server restarting on change. package.json modified 
// added   "start": "nodemon app.js"
