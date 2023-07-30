const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
Models = require('./models.js'),
passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({Username: username})
            .then((user) => {
                if(!user) {
                    console.log('incorrect username');
                    return callback(null, false, {
                        message: 'Incorrect username or password.',
                    });
                }
                // if (!user.validatePassword(Password)) {
                //     console.log('Incorrect password');                               //According to forum this is for 2.10
                //     return callback(null, false, {message: 'Incorrect password.'});//Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGM1NjgyMDUzYjVjYTRmNDIyODM3YWUiLCJVc2VybmFtZSI6Ik1pdGNoZWxsIiwiUGFzc3dvcmQiOiJNaXRjaGVsbCIsIkVtYWlsIjoiTWl0Y2hlbGxAZ21haWwuY29tIiwiQmlydGhkYXkiOiIxOTY5LTA0LTIwVDAwOjAwOjAwLjAwMFoiLCJGYXZvcml0ZU1vdmllcyI6W10sIl9fdiI6MCwiaWF0IjoxNjkwNjYyNjAwLCJleHAiOjE2OTEyNjc0MDAsInN1YiI6Ik1pdGNoZWxsIn0.i13URKRuQ4GmaE3WTY0bcS5ha1CA3lHdNvue5o8JumU
                // }
                console.log('finished');
                return callback(null, user);
            })
            .catch((error) => {
                if (error) {
                    console.log(error);
                    return callback(error);
                }
            })
        }
    )
);

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
    return await Users.findById(jwtPayload._id)
    .then((user) => {
        return callback(null, user);
    })
    .catch((error) => {
        return callback(error)
    });
}));