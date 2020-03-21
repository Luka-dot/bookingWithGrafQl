const mongoose = require('mongoose');
// need schema from mongoose package
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    // each user can create multiple events. therefor use [] inside create single model {}
    // only storing IDs with syntax below 
    createdEvents: [
        {
            type: Schema.Types.ObjectId,
            // ref helps set up connection between models. passing name of the model to connect to this case 'Event'
            ref: 'Event'    
        }
    ]
});

module.exports = mongoose.model('User', userSchema);