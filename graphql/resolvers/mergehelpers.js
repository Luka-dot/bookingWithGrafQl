const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

const events = async eventIds => {
    try {
    // looking for all events where all IDs in list of IDs in []  $in is operator in mongoDB
    const events = await Event.find({_id: {$in: eventIds}})
    return events.map(event => {  
                // manually connecting events (using functions that will return data) and users with IDs in the database
                // whenever incoming query accessing property, grafQl evokes function and return result of that function
                return transformEventForDatabase(event);
            });
    }
    catch (err) {
    throw err;
    };
};
// same as event, just need single one so no need for map
const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEventForDatabase(event)
    } catch (err) {
        throw err;
    }
}

// fetching user by the ID 
const user = async userId => {
    try {
    const user = await User.findById(userId)
        // manually connecting events (using functions that will return data) and users with IDs in the database
        return { ...user._doc,
                     _id: user.id, 
                     createdEvents: events.bind(this, user._doc.createdEvents) 
                };
        }
        catch(err) {
            throw err;
        };
}

//helper function due to repeating code in 3 calls
// manually connecting events (using functions that will return data) and users with IDs in the database
const transformEventForDatabase = event => {
    return { ...event._doc,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator) 
    };
}

const transformBookingForDatabase = booking => {
    return {
        ...booking._doc,
        _id: booking.id,
        user: user.bind(this, booking._doc.user), 
        event: singleEvent.bind(this, booking._doc.event), 
        createdAt: dateToString(booking._doc.createdAt),  
        updatedAt: dateToString(booking._doc.updatedAt)  
    }
}

exports.transformEventForDatabase = transformEventForDatabase;
exports.transformBookingForDatabase = transformBookingForDatabase;

// exports.user = user;
// exports.events = events;
// exports.singleEvent = singleEvent;