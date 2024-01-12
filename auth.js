const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

/**
 * @description Handles login request.
 * @name Post /login
 * @param {string} username has to be at least six characters
 * @param {string} password has to be at least six characters
 * @returns {Promise} A promise that resolves when the user is logged in.
 * @returns {Object} Returns the user as well as their token.
 * @throws {object} Error if not a user in database or failed post.
 * @example 
 * request data format
 * {
 *      Username: "",
 *      Password: ""
 * }
 * @example 
 * response data format
 * {
 *  "Username": "",
 *  "Password": "",
 *  "Email": "",
 *  "Birthday:" ""
 * }
 * {
 *      "Authentication": "JWT"
 * }
 */

// POST login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            console.log(error, user)
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something went wrong',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}