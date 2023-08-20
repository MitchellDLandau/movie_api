const express = require('express');
uuid = require('uuid');
const { check, validationResult } = require('express-validator');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));


const cors = require('cors');
let allowedOrigins = ['http://localhost:1234', 'http://localhost:8080'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genre = Models.Genre;
const Directors = Models.Director
const Heroes = Models.Heroes

// mongoose.connect('mongodb://127.0.0.1:27017/MovieDB', {useNewUrlParser: true, useUnifiedTopology: true}); 
//Kept for local testing and can be removed. 

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//getting all users information (ADMIN ONLY)
//The setTimeout could be replaced with a then statement in the future to streamline the code (in all admin only).
//Get all users (ADMIN ONLY).
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    setTimeout(async function () {
        if (req.user.Fork !== 'spoon') {
            return res.status(400).send('Only moderators can use this function.');
        }
        await Users.find()
            .then((users) => {
                res.status(200).json(users);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    }, 0);
});


//Get a user by their ID (ADMIN ONLY).
app.get('/users/:userID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    setTimeout(async function () {
        if (req.user.Fork !== 'spoon') {
            return res.status(400).send('Only moderators can use this function.');
        }
        await Users.findOne({ _id: req.params.userID })
            .then((user) => {
                res.json(user);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    }, 0);
});

//Get a json of all movies.
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`)
        });
});

//Get a movie via its ID.
app.get('/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ _id: req.params.movieID })
        .then((movie) => {
            if (movie) {
                return res.status(200).json(movie);
            } else {
                return res.status(404).send(`${movie} is not in our reccords`)
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Get a genre description by GenreName (marvel phase).
app.get('/movies/Genre/:GenreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ GenreName: req.params.Name })
        .then((genre) => {
            if (genre) {
                return res.status(200).json(genre.Genre);
            } else {
                return res.status(404).send(`${genre} is not an MCU phase.`)
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Get director information.
app.get('/movies/director/:DirectorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ DirectorName: req.params.Name })
        .then((director) => {
            if (director) {
                res.status(200).json(director.Director);
            } else {
                res.status(400).send(`${director} has not directed an MCU movie.`)
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Get movies that a requested hero is in.
app.get('/movies/Heroes/:Heroes', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ Heroes: req.params.Heroes })
        .then((movies) => {
            res.status(200).json(movies)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Updating a movie (ADMIN ONLY).
app.put('/movies/:movieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    setTimeout(async function () {
        if (req.user.Fork !== ('spoon')) {
            return res.status(400).send('Only moderators can update a movies information.');
        }
        await Movies.findOneAndUpdate({ _id: req.params.movieID },
            {
                $set:
                {
                    Title: req.body.Title,
                    Description: req.body.Description,
                    Genre: req.body.Genre,
                    Director: req.body.Director,
                    ImagePath: req.body.imagePath,
                    Heroes: req.body.Heroes,
                    Villain: req.body.Villain
                }
            },
            { new: true })
            .then((updatedMovie) => {
                res.json(updatedMovie);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    }, 0);
});

//Updating a Users information (only when logged in as the user).
app.put('/users/:userID', passport.authenticate('jwt', { session: false }),
    [
        check('Username', '1Username must be 6 characters').isLength({ min: 6 }),
        check('Username', '1Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', '1Password is required.').not().isEmpty(),
        check('Email', '1Email does not seem to be valid.').isEmail()
    ],
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        if (req.user.id !== req.params.userID) {
            return res.status(400).send('Permission denied');
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOneAndUpdate({ _id: req.params.userID },
            {
                $set:
                {
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }
            },
            { new: true })
            .then((updatedUser) => {
                res.json(updatedUser);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            })
    });

//Adding to a users favorite movies (while logged in as the user).
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate(
        { Username: (req.params.Username) },
        { $addToSet: { FavoriteMovies: req.params.MovieID } },
        { new: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).send(`Error ${req.params.Username} does not exist.`)
            } else {
                res.json(updatedUser)
            };
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

//Adding a user.
app.post('/users',
    [
        check('Username', 'Username is required.').isLength({ min: 6 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required.').not().isEmpty(),
        check('Email', 'Email does not seem to be valid.').isEmail()
    ],
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        console.log(req.body)
        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(`${req.body.Username} already exists.`);
                } else {
                    Users.create(
                        {
                            Username: req.body.Username,
                            //Password: hashedPassword,  removed as this should not be sent back to the user. Used for testing.
                            Email: req.body.Email,
                            Birthday: req.body.Birthday,
                            Auth: 'False'
                        })
                        .then((user) => { res.status(200).json(user) })
                        .catch((err) => {
                            console.error(err);
                            res.status(500).send(`Error: ${err}`);
                        });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    });

//Adding a new Movie to the database (ADMIN ONLY).
app.post('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    setTimeout(async function () {
        if (req.user.Fork !== ('spoon')) {
            return res.status(400).send('Only moderators can add new movies.');
        }
        console.log(req.body)
        await Movies.findOne({ Title: req.body.Title })
            .then((title) => {
                if (title) {
                    return res.status(400).send(`We already have ${title.Title}`);
                } else {
                    Movies.create(
                        {
                            Title: req.body.Title,
                            Description: req.body.Description,
                            Genre: req.body.Genre,
                            Director: req.body.Director,
                            ImagePath: req.body.imagePath,
                            Heroes: req.body.Heroes,
                            Villain: req.body.Villain
                        })
                        .then((movie) => { res.status(200).json(movie) })
                        .catch((err) => {
                            console.error(err);
                            res.status(500).send(`Error: ${err}`);
                        })
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    }, 0);
});

//Deleting a user (while logged in as the user).
app.delete('/users/:userID', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.id !== req.params.userID) {
        return res.status(400).send('Permission denied');
    }
    Users.findOneAndRemove({ _id: req.params.userID })
        .then((user) => {
            if (!user) {
                res.status(400).send(`${user.Username} was not found.`);
            } else {
                res.status(200).send(`${user.Username} was deleted.`);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Deleting a movie (ADMIN ONLY).
app.delete('/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    setTimeout(async function () {
        if (req.user.Fork !== ('spoon')) {
            return res.status(400).send('Only moderators can delete a movie.');
        }
        Movies.findOneAndRemove({ _id: req.params.movieID })
            .then((movie) => {
                if (movie) {
                    res.status(200).send(`${movie.Title} has been removed from the database.`);
                } else {
                    return res.status(404).send(`${movie.Title} is not in our reccords.`);
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    }, 0);
});

//Deleting a favorite movie from a users favorite movie array (While logged in as the user).
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true })
        .then((user) => {
            if (!user) {
                res.status(400).send(`ID ${req.params.MovieID} was not in ${req.params.Username}'s favorite movies`);
            } else {
                res.status(200).send(`ID ${req.params.MovieID} has been removed from ${req.params.Username}'s fovorite movies.`);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/', (req, res) => {
    res.status(200).send("Connected")
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('app running on port ' + port);
});

//Kept for local testing and can be removed. 
// app.listen(8080, () => {
//     console.log('running on port 8080'); 
// });