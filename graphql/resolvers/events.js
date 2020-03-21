const Event = require('../../models/event');
const { transformEventForDatabase } = require('./mergehelpers');

module.exports = {
    events: async () => {         // populate() is mongoose function. inside passing what to populate. this case it is CREATOR in model/event.js
        try {
        const events = await Event.find().populate('creator')    // need return so grafQl  express know this is async opp and waits for it to complete
                // for each event ran: _doc is a property provided by Mongoose. gives {} all properties without metadata
                return events.map(event => {
                    return transformEventForDatabase(event);
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
                createdEvent = transformEventForDatabase(result);
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
    }
    
};