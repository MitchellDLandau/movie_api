const express = require ('express');
    bodyParser = require ('body-parser');
    uuid = require ('uuid');

const app = express();
const mongoose = require('mongoose');
const Models = require('./models.js');
app.use(bodyParser.json());

const Movies = Models.Movie;
const Users = Models.User;
const Genre = Models.Genre;
const Directors =  Models.Director
const Heroes = Models.Heroes

mongoose.connect('mongodb://localhost:27017/MovieDB', {useNewUrlParser: true, useUnifiedTopology: true});

//2.8 getting all users information
 app.get('/users', (req, res) => {
    Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
    });
 });

 //2.8 get a user by their name (may not be needed)
 app.get('/users/:Username', (req, res) => {
 Users.findOne({Username: req.params.Username})
 .then ((user) => {
     res.json(user);
 })
 .catch((err) => {
     console.error(err);
     res.status(500).send(`Error: ${err}`);
 });
});

 //2.8 *(getting a json of all movies)
 app.get('/movies', (req, res) => {
    Movies.find()
    .then((movie) => {
        res.status(200).json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`)
    });
 });

 //2.8 *(getting a movie via its title)
 app.get('/movies/:Title', (req, res) => {
    Movies.findOne({Title: req.params.Title})
    .then ((movie) => {
        if (movie) {
            return res.status(200).json(movie);
        } else {
            return res.status(404).send(`${movie} is not in our reccords`) //this is not required I am adding it to try and give more      information in my final project.
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
    });
 });

 //2.8 *get movie via genre (marvel phase) name.
 app.get('/movies/Genre/:GenreName', (req, res) => {
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

 //2.8 *get director information.
 app.get('/movies/director/:DirectorName', (req, res) => {
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

 //2.8 Get movies that a requested hero is in.
app.get('/movies/Heroes/:Heroes', (req, res) => {
    Movies.find({Heroes: req.params.Heroes})
    .then((movies) => {
        res.status(200).json(movies)             //Trying to return the movies a hero is in (Hero is stored in an array) forEach?
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
    });
});

//2.8 Updating a movie.
app.put('/movies/:Title', async (req, res) => {
    await Movies.findOneAndUpdate({Title: req.params.Title},
        { $set:
            {
                Title: req.body.Title,
                Description: req.body.Description,
                Genre: req.body.Genre, 
                Director: req.body.Director,        //JUST UPDATED TO NEW MONGOOSE MODEL
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

 //2.8 *(Updating a Users information)
app.put('/users/:Username', async (req, res) => {
    await Users.findOneAndUpdate({Username: req.params.Username}, 
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

 //2.8 *(Adding a users favorite movies)
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate(
        {Username: (req.params.Username)}, 
        {$addToSet: {FavoriteMovies: req.params.MovieID}},
        { new: true })
            .then((updatedUser) => {
                if (!updatedUser) {
                    return res.status(404).send(`Error ${req.params.Username} does not exist.`)
                } else {
                res.json(updatedUser)};                  //Running in to a BSONError
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(`Error: ${err}`);
            });
    });

//2.8 *(Adding a user)
app.post('/users', (req, res) => {
    console.log(req.body)
    Users.findOne({Username: req.body.Username})
    .then ((user) => {
        if (user) {
            return res.status(400).send(`${req.body.Username} already exists.`);
        } else {
            Users.create(
                {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
                })
            .then((user) => {res.status(201).json(user)})
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

//2.8 Adding a new Movie to the DB
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
                .then((movie) => {res.status(201).json(movie)})
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

//2.8 *(Deleting a user)
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
        if (!user) {
            res.status(400).send(`${req.params.Username} was not found.`);
        } else {
            res.status(200).send(`${req.params.Username} was deleted.`);
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//2.8 Deleting a movie
app.delete('/movies/:Title', (req, res) => {
    Movies.findOneAndRemove({Title: req.params.Title})
    .then((movie) => {
    if (movie) {
        res.status(200).send(`${movie.Title} has been removed from the database.`);     //not sure if this is needed
    } else {
        return res.status(404).send(`${req.params.Title} is not in our reccords.`);
    }
})
    .catch((err) => {
        console.error(err); 
        res.status(500).send(`Error: ${err}`);
    });
});

//2.8 *Deleting a favorite movie from a users favorite movie array
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
