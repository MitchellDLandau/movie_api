const express = require ('express');
    //bodyParser = require ('body-parser');
    uuid = require ('uuid');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
//app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

//2.8 Updating a movie.          (Need to impliment admin)
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

 //2.8 ~*(Updating a Users information)
app.put('/users/:userID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(req.user.id !== req.params.userID){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({_id: req.params.userID}, 
        { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
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

//2.8 ~*(Adding a user)
// app.post('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
//     console.log(req.body)
//     Users.findOne({Username: req.body.Username})
//     .then ((user) => {
//         if (user) {
//             return res.status(400).send(`${req.body.Username} already exists.`);
//         } else {
//             Users.create(
//                 {
//                 Username: req.body.Username,
//                 Password: req.body.Password,
//                 Email: req.body.Email,
//                 Birthday: req.body.Birthday
//                 })
//             .then((user) => {res.status(200).json(user)})
//             .catch((err) => {console.error(err);
//             res.status(500).send(`Error: ${err}`);
//             })
//         }
//     })
//     .catch((err) => {
//         console.error(err);
//         res.status(500).send(`Error: ${err}`);
//     });
// });

//2.8 Adding a new Movie to the DB   (Need to impliment admin)
app.post('/movies', (req, res) => {
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

//2.8 Deleting a movie                  (Need to impliment Admin)
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
