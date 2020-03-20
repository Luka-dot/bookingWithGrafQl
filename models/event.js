const mongoose = require('mongoose');
// need schema from mongoose package
const Schema = mongoose.Schema;
// using new Schema to guarantee every event object will look the same (ref to app.js -> schema: buildSchema).
const eventSchema = new Schema({
    title: {
        type: String,
        required: true  // prevent null
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date, // mongoDB had a Date type. in graphQL it is defined as string since graphQL dont have Date type
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        // ref helps set up connection between models. passing name of the model to connect to this case 'User'
        ref: 'User'
    }
});
// schema is used by model to create objects for application
// first argument -> name of the model, 2nd argument -> points to schema
module.exports = mongoose.model('Event', eventSchema, )