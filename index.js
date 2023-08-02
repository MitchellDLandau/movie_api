const express = require ('express');
    uuid = require ('uuid');
const { check, validationResult } = require ('express-validator');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
app.use(express.json());
app.use(express.urlencoded({extended: true}));


const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application does not allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth.js')(app);

const passport = require ('passport');
require('./passport.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genre = Models.Genre;
const Directors =  Models.Director
const Heroes = Models.Heroes

mongoose.connect('mongodb://127.0.0.1:27017/MovieDB', {useNewUrlParser: true, useUnifiedTopology: true});

//2.8 getting all users information (need to impliment admin)
 app.get('/users', (req, res) => {
    Users.find()
    .then((users) => {
        res.status(200).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
    });
 });

 //2.8 get a user by their ID (need to impliment admin)
 app.get('/users/:userID', (req, res) => {
 Users.findOne({_id: req.params.userID})
 .then ((user) => {
     res.json(user);
 })
 .catch((err) => {
     console.error(err);
     res.status(500).send(`Error: ${err}`);
 });
});

 //2.8 ~*(getting a json of all movies)
 app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.find()
    .then((movie) => {
        res.status(200).json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`)
    });
 });

 //2.8 ~*(getting a movie via its ID)
 app.get('/movies/:movieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({_id: req.params.movieID})
    .then ((movie) => {
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

 //2.8 ~*get movie via genre (marvel phase) name.
 app.get('/movies/Genre/:GenreName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({GenreName: req.params.Name})
    .then ((genre) => {
        if (genre) {
            return res.status(200).json(genre.Genre);
        } else {
            return res.status(404).send(`${genre} is not an MCU phase.`)    //using genre in the future for marvel phases
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
    });
 });

 //2.8 ~*get director information.
 app.get('/movies/director/:DirectorName', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({DirectorName: req.params.Name})
    .then ((director) => {
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

 //2.8 ~Get movies that a requested hero is in.
app.get('/movies/Heroes/:Heroes', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find({Heroes: req.params.Heroes})
    .then((movies) => {
        res.status(200).json(movies)
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
    });
});

//2.8 Updating a movie.          (Need to impliment admin)   ~~~~~~~~~~~~~~~~
app.put('/movies/:movieID', async (req, res) => {
    await Movies.findOneAndUpdate({_id: req.params.movieID},
        { $set:
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
        .then((updatedMovie) =>{
            res.json(updatedMovie);
        })
        .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
        });
});

 //2.8 ~*(Updating a Users information) ~~~~~~~~~~~~~
app.put('/users/:userID', passport.authenticate('jwt', {session: false}),
[
    check('Username', '1Username must be 6 characters').isLength({min: 6}),
    check('Username', '1Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', '1Password is required.').not().isEmpty(),
    check('Email', '1Email does not seem to be valid.').isEmail()
],
 async (req, res) => {
    let errors = validationResult(req);     //This works but can I make it so only one needs to be entered and not all info again
    if(!errors.isEmpty()) {                 //Or will this be easily accomplished on the back end by passing through old info?
        return res.status(422).json({errors: errors.array()});
    }
    if(req.user.id !== req.params.userID){
        return res.status(400).send('Permission denied');
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate({_id: req.params.userID}, 
        { $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true })
    .then((updatedUser) =>{
        res.json(updatedUser);
    })
    .catch((err) => {
            console.error(err);
            res.status(500).send(`Error: ${err}`);
    })    
});

 //2.8 ~*(Adding a users favorite movies) 
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate(
        {Username: (req.params.Username)}, 
        {$addToSet: {FavoriteMovies: req.params.MovieID}},
        { new: true })
            .then((updatedUser) => {
                if (!updatedUser) {
                    return res.status(404).send(`Error ${req.params.Username} does not exist.`)
                } else {
                res.json(updatedUser)};
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    });

//2.8 ~*(Adding a user) ~~~~~~~~~~
app.post('/users', 
[
    check('Username', 'Username is required.').isLength({min: 6}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required.').not().isEmpty(),
    check('Email', 'Email does not seem to be valid.').isEmail()
], 
async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    console.log(req.body)
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({Username: req.body.Username})
    .then ((user) => {
        if (user) {
            return res.status(400).send(`${req.body.Username} already exists.`);
        } else {
            Users.create(
                {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
                })
            .then((user) => {res.status(200).json(user)})
            .catch((err) => {console.error(err);
            res.status(500).send(`Error: ${err}`);
            });
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
    });
});

//2.8 Adding a new Movie to the DB   (Need to impliment admin)   ~~~~~~~~~~~~~
app.post('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {                      //added passport
    if(req.user.Password !== ('$2b$10$Hf7vapuVRymgKbANoLZ69etI5CmdnpLZyu0YmQ0eLcaaZdsCCX7ui') && 
    req.user.id !== ('64c973a1168299140e1d638a')){                                                  //added whole if statement up to line 259
        return res.status(400).send('Permission denied');
    }
    console.log(req.body)
    Movies.findOne({Title: req.body.Title})
    .then ((title) => {
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
                .then((movie) => {res.status(200).json(movie)})
                .catch((err) => {console.error(err);
                res.status(500).send(`Error: ${err}`);
                })
            }
       })
       .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
       });
    });

//2.8 ~*(Deleting a user)
app.delete('/users/:userID', passport.authenticate('jwt', {session: false}), (req, res) => {
    if(req.user.id !== req.params.userID){
        return res.status(400).send('Permission denied');
    }
    Users.findOneAndRemove({_id: req.params.userID})
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

//2.8 Deleting a movie                  (Need to impliment Admin)   64c973a1168299140e1d638a
app.delete('/movies/:movieID', (req, res) => {
    Movies.findOneAndRemove({_id: req.params.movieID})
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
});

//2.8 ~*Deleting a favorite movie from a users favorite movie array
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    Users.findOneAndUpdate(
        {Username: req.params.Username}, 
        {$pull: {FavoriteMovies: req.params.MovieID} }, 
        {new: true})
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

app.listen(8080, () => {
    console.log('app running on port 8080.');
});



//{
//     "Username": "Mitchell",
//     "Password": "Mitch",
//     "Email": "Mitch@gmail.com",
//     "Authorization": "Admin"
// }

//Mitchell Auth code: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGM5NzNhMTE2ODI5OTE0MGUxZDYzOGEiLCJVc2VybmFtZSI6Ik1pdGNoIiwiUGFzc3dvcmQiOiIkMmIkMTAkcll1N0tUUXI0Qkc3NzQwT3ZhRUk2dUsyY29qY0N0b1lxMS4uTjlGWm5SMWF5Tk1OMW5NMzIiLCJFbWFpbCI6Ik1pdGNoQGdtYWlsLmNvbSIsIkZhdm9yaXRlTW92aWVzIjpbXSwiX192IjowLCJpYXQiOjE2OTA5MjM5NjMsImV4cCI6MTY5MTUyODc2Mywic3ViIjoiTWl0Y2gifQ.jncz31MfJQJvd9HE5NxM2E_Z8zbYdlKAk_O8Ep6IFHQ"

//Mitchell ID "64c973a1168299140e1d638a"

// Madi "_id": "64c93da7ededc7176ecf4569"

//Madi Auth code: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGM5M2RhN2VkZWRjNzE3NmVjZjQ1NjkiLCJVc2VybmFtZSI6Ik1hZGkiLCJQYXNzd29yZCI6IiQyYiQxMCRJOC44MWQua0dMUnVlQnpTV1dlYXgueVRhNHhJbEU1a3BudEo0VTdNTWhCa1VPQ2RLNHhJbSIsIkVtYWlsIjoiTWFkaUBnbWFpbC5jb20iLCJGYXZvcml0ZU1vdmllcyI6W10sIl9fdiI6MCwiaWF0IjoxNjkwOTI3OTIxLCJleHAiOjE2OTE1MzI3MjEsInN1YiI6Ik1hZGkifQ.amoAppIAL8sMkGykbvoh1EoR1u8uWn43-IZuxTXhBP0

// {
//     "Title": "Testing",
//     "Description": "Testing description"
// }

// {
//     "_id": "64c93847ededc7176ecf455c",
//     "Username": "Austin",
//     "Password": "$2b$10$GzAjWl0.DW97dTl2TFwPtupGrpQNlkmSP0Dm.Wd0w0yu0QYLukM9y",
//     "Email": "Austin",
//     "FavoriteMovies": [],
//     "__v": 0
// },

// Austin auth code: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGM5Mzg0N2VkZWRjNzE3NmVjZjQ1NWMiLCJVc2VybmFtZSI6IkF1c3RpbiIsIlBhc3N3b3JkIjoiJDJiJDEwJEd6QWpXbDAuRFc5N2RUbDJURndQdHVwR3JwUU5sa21TUDBEbS5XZDB3MHl1MFFZTHVrTTl5IiwiRW1haWwiOiJBdXN0aW4iLCJGYXZvcml0ZU1vdmllcyI6W10sIl9fdiI6MCwiaWF0IjoxNjkwOTI5MzkwLCJleHAiOjE2OTE1MzQxOTAsInN1YiI6IkF1c3RpbiJ9.XMbpnZaOJjI3HAw61bQeU9-tuel8UqDvUl23BMoImas