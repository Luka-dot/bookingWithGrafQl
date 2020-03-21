const jwt = require('jsonwebtoken');
// this middleware is checking for authentication with token
// it always be true and allows access to the endpoint, but will only attache token if pass all the if statement
// this will be implemented in app.js
module.exports = (reg, res, next) => {
    const authHeader = reg.get('Authorization');
    if (!authHeader) {
        // letting user continue even if authHeader fails
        reg.isAuth = false;
        return next();
    }
    // splitting on white space and accessing 2nd  one
    const token = authHeader.split(' ')[1]; 
    if (!token || token === '') {
        reg.isAuth = false;
        return next();
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretkey')
    } catch (err) {
        reg.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        reg.isAuth = false;
        return next();
    }
    reg.isAuth = true;
    reg.userId = decodedToken.userId;
    next();
}
