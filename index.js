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
let allowedOrigins = ['http://localhost:1234',
    'http://localhost:8080',
    'https://marvel-movie-mapper.netlify.app',
    'https://mitchelldlandau.github.io'
];

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

/**
 * Handles requesting a single users information.
 * @function
 * @name GetAUsers
 * @param {Object} username has to be at least six characters
 * @returns {Promise} A promise that resolves if user is an admin.
 * @returns {Object} Returns the requested user in JSON.
 * @throws {String} Error if not admin returns string.
 * @throws {Error} Error response if the user is not found.
 */
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

/**
 * Handles requesting a single users information.
 * @function
 * @name GetYourUserInfo
 * @param {string} userID Users id number.
 * @returns {Promise} A promise that resolves if user is found.
 * @returns {Object} Returns the requested user in JSON.
 * @throws {String} Error if not the user who requested the info.
 * @throws {Error} Error response if the user is not found.
 */

app.get('/users/:userID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ _id: req.params.userID })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
        });
});

/**
 * Handles requesting all movies.
 * @function
 * @name GetAllMovies
 * @param {Object} req Requesting all movies in the database.
 * @param {Object} res Responds with json of all movies. 
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the requested movies in JSON.
 * @throws {String} Error if not a propper token or user.
 */
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

/**
 * Handles requesting a movie.
 * @function
 * @name GetAMovies
 * @param {Object} movieID The movies unique ID.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the requested movie in JSON.
 * @throws {String} If the movie is not in the database. 
 * @throws {String} Error if not a propper token or user.
 */
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

/**
 * Handles requesting a genres information.
 * @function
 * @name GetGenre
 * @param {Object} GenreName The genre's name that info is being requested for.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the requested info in JSON.
 * @throws {String} If the genre is not in the database. 
 * @throws {String} Error if not a propper token or user.
 */
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

/**
 * Handles requesting a directors information.
 * @function
 * @name GetDirector
 * @param {Object} DirectoreName The director's name that info is being requested for.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the requested info in JSON.
 * @throws {String} If the director is not in the database. 
 * @throws {String} Error if not a propper token or user.
 */
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

/**
 * Handles requesting movies a hero is in.
 * @function
 * @name GetHero
 * @param {Object} Heroes The heroes name that info is being requested for.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the requested info in JSON.
 * @throws {String} If the hero is not in the database. 
 * @throws {String} Error if not a propper token or user.
 */
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

/**
 * Handles updating a movie in the database.
 * @function
 * @name UpdateAMovie
 * @param {Object} movieID The movieID for the movie being updated.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the movie in JSON.
 * @throws {String} Error if not a propper token or user.
 * @throws {String} Error if user logged in is not a admin.
 */
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

/**
 * Handles updating a users info in the database.
 * @function
 * @name UpdateAUser
 * @param {Object} userID The userID for the user being updated.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the user in JSON.
 * @throws {String} Error if not a propper token or user.
 * @throws {String} Error if not the correct user who requested the change.
 */
app.put('/users/:userID', passport.authenticate('jwt', { session: false }),
    [
        check('Username', '1Username must be 6 characters').isLength({ min: 6 }),
        check('Username', '1Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required.').not().isEmpty(),
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

/**
 * Handles adding a movie to their favorite movies array.
 * @function
 * @name AddToFavorites
 * @param {Object} Username The Username for the user being updated.
 * @param {Object} MovieID The MovieID for the user being updated.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the user in JSON.
 * @throws {String} Error if not a propper token or user.
 * @throws {String} Error if not the correct user who requested the change.
 */
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

/**
 * Handles adding a new user.
 * @function
 * @name AddNewUser
 * @param {Object} req requesting that a new user be created.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {Object} Returns the user in JSON.
 * @throws {String} Error if the user already exists.
 * @throws {String} Error if server error.
 */
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
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birthday: req.body.Birthday,
                            Auth: 'False'
                        })
                        .then((user) => {
                            const userWithoutPassword = { ...user._doc };
                            delete userWithoutPassword.Password;
                            res.status(200).json(userWithoutPassword)
                        })
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

/**
 * Handles adding a movie in the database.
 * @function
 * @name AddAMovie
 * @param {Object} req request to add a new movie.
 * @returns {Promise} A promise that resolves when the movie is added.
 * @returns {Object} Returns the movie in JSON.
 * @throws {String} Error if movie was not added.
 * @throws {String} Error if user logged in is not a admin.
 */
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
                            Genre: { Name: req.body.Genre },
                            Director: { Name: req.body.Director },
                            ImagePath: req.body.ImagePath,
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

/**
 * Handles deleting a users account.
 * @function
 * @name DeleteAUser
 * @param {Object} userID The userID for the user being deleted.
 * @returns {Promise} A promise that resolves when the user is deleted.
 * @returns {String} Returns that the user was deleted.
 * @throws {String} Error if not a propper token or user.
 * @throws {String} Error if not deleted or server error.
 */
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

/**
 * Handles deleting a movie from the database if admin.
 * @function
 * @name DeleteAMovie
 * @param {Object} movieID The movieID for the movie being deleted.
 * @returns {Promise} A promise that resolves when request is complete.
 * @returns {String} That the movie has been deleted.
 * @throws {String} Error if not a propper token or user.
 * @throws {String} Error if user logged in is not a admin.
 * @throws {String} Error if movie is not in the database.
 */
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
/**
 * Handles deleting a movie from the users favorite array.
 * @function
 * @name DeleteFavorite
 * @param {Object} Username The username for the user.
 * @param {Object} movieID The movieID for the movie being removed.
 * @returns {Promise} A promise that resolves when the movie is removed.
 * @returns {String} That the movie has been removed from the users array.
 * @throws {String} Error if not a propper token or user.
 * @throws {String} Error if movie is not in their favorites.
 */
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