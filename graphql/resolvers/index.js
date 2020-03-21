const bcrypt = require('bcryptjs');
// importing schema model
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const events = async eventIds => {
    try {
    // looking for all events where all IDs in list of IDs in []  $in is operator in mongoDB
    const events = await Event.find({_id: {$in: eventIds}})
    events.map(event => {  
                // manually connecting events (using functions that will return data) and users with IDs in the database
                // whenever incoming query accessing property, grafQl evokes function and return result of that function
                return { ...event._doc,
                            date: new Date(event._doc.date).toISOString(),
                            creator: user.bind(this, event.creator) 
                        };
            });
        return events;
    }
    catch (err) {
    throw err;
    };
};
// same as event, just need single one so no need for map
const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return { ...event._doc,
                    creator: user.bind(this, event.creator)     
        }
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

module.exports = {
    events: async () => {         // populate() is mongoose function. inside passing what to populate. this case it is CREATOR in model/event.js
        try {
        const events = await Event.find().populate('creator')    // need return so grafQl  express know this is async opp and waits for it to complete
                // for each event ran: _doc is a property provided by Mongoose. gives {} all properties without metadata
                return events.map(event => {
                    return { ...event._doc,
                                date: new Date(event._doc.date).toISOString(),
                                creator: user.bind(this, event._doc.creator)  //pointing to user function line 31
                            };
                });
        } catch (err) {
          throw err;
        }
    },
    bookings: async () => {
        try {
          const bookings = await Booking.find();
          return bookings.map(booking => {
            return {
              ...booking._doc,
              _id: booking.id,
              user: user.bind(this, booking._doc.user),
              event: singleEvent.bind(this, booking._doc.event),
              createdAt: new Date(booking._doc.createdAt).toISOString(),
              updatedAt: new Date(booking._doc.updatedAt).toISOString()         
                }
            });
        } catch (err) {
            throw err;
        }
    },
    // passing argument = args  since 'buildSchema' for this 'type' expects argument 
    createEvent: async args => {
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
            creator: '5e755d5eb596a6b4309070bc'
        });
        let createdEvent;
        try {
        const result = await event   // need return so grafQl  express know this is async opp and waits for it to complete
            .save()
                createdEvent = { ...result._doc,
                                    date: new Date(event._doc.date).toISOString(),
                                    creator: user.bind(this, result._doc.creator) };
                const creator = await User.findById('5e755d5eb596a6b4309070bc')
                               // _doc is a property provided by Mongoose. gives {} all properties without metadata
                if (!creator) {
                    throw new Error('User not found.')
                }
                creator.createdEvents.push(event);
                await creator.save();

                return createdEvent;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
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
    // expecting bookingId in the args
    bookEvent: async args => {
        const fetchEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: '5e755d5eb596a6b4309070bc',
            event: fetchEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result.id,
            user: user.bind(this, booking._doc.user), 
            event: singleEvent.bind(this, booking._doc.event), 
            createdAt: new Date(result._doc.createdAt).toISOString(),  
            updatedAt: new Date(result._doc.updatedAt).toISOString()  
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = { ...booking.event._doc, creator: user.bind(this, booking.event._doc.creator) }
            await Booking.deleteOne({_id: args.bookingId});
            return event;
        } catch (err) {
            throw err;
        }
    }
};