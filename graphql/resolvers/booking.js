// need Event and Booking model
const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformEventForDatabase, transformBookingForDatabase } = require('./mergehelpers');

module.exports = {
    bookings: async () => {
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
    bookEvent: async args => {
        const fetchEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: '5e755d5eb596a6b4309070bc',
            event: fetchEvent
        });
        const result = await booking.save();
        return transformBookingForDatabase(result)
    },
    cancelBooking: async args => {
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