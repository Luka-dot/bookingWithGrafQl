const { buildSchema } = require('graphql');

// passing configure in {} inside graphqlHttp, points to schema and resolvers
// type key word - defines what certain end-points return. Then tied them to schema
/* Event: ! so it can not be null. using  _id since MongoDB using the same
/* RootQuery: ! inside [] ensure array wont be null. ! outside ensure return wont be null  returns array of Events */
/* RootMutation: expected value 'name' type is string and returns Event we just created */
module.exports = buildSchema(`
type Booking {
    _id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
}

type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!
    creator: User!
}

type User {
    _id: ID!
    email: String!
    password: String
    createdEvents: [Event!]
}

type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
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
    bookings: [Booking!]
    login(email: String!, password: String!): AuthData!
}

type RootMutation {
    createEvent(eventInput: EventInput): Event
    createUser(userInput: UserInput): User
    bookEvent(eventId: ID!): Booking! 
    cancelBooking(bookingId: ID!): Event!
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`)