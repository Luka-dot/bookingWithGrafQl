// need Event and Booking model
const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformEventForDatabase, transformBookingForDatabase } = require('./mergehelpers');

module.exports = {
    bookings: async (args, reg) => {
        // checking authentication here
        if (!reg.isAuth) {
            throw new Error('no access to this function, please login')
        }
        try {
          const bookings = await Booking.find();
          return bookings.map(booking => {
            return transformBookingForDatabase(booking)
            });
        } catch (err) {
            throw err;
        }
    },
    
    // expecting bookingId in the args
    bookEvent: async (args, reg) => {
        // checking authentication here
        if (!reg.isAuth) {
            throw new Error('no access to this function, please login')
        }
        const fetchEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: reg.userId,
            event: fetchEvent
        });
        const result = await booking.save();
        return transformBookingForDatabase(result)
    },
    cancelBooking: async (args, reg) => { 
        // checking authentication here
        if (!reg.isAuth) {
            throw new Error('no access to this function, please login')
        }
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEventForDatabase(booking.event)
            await Booking.deleteOne({_id: args.bookingId});
            return event;
        } catch (err) {
            throw err;
        }
    }
};