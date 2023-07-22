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

// let users = [
//     {
//         id: 1,
//         name: "Madi Stonewall",
//         favoriteMovies: ["Lion King"]
//     },
//     {
//         id: "2",
//         name: "Mitchell Landau",
//         favoriteMovies: ["Iron Man"]
//     },
//     {
//         id: "3",
//         name: "Loki Bean",
//         favoriteMovies: ["dog"]
//     }

// ];

let movies = [
    {
        "Title": 'Iron Man',
        "_id": 1,
        "Description": 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.',
        "Genre": {
            "Name": 'Superhero Film',
            "Genre Description": "A superhero film is a film that focuses superheroes and their actions. Superheroes are individuals who possess superhuman abilities and are dedicated to protecting the public. These films typically feature action, adventure, fantasy, or science fiction elements.",
        },
        "Director": {
            "Name": 'Jon Favreau',
            "Bio": 'Initially an indie film favorite, actor Jon Favreau has progressed to strong mainstream visibility into the millennium and, after nearly two decades in the business, is still enjoying character stardom as well as earning notice as a writer/producer/director.'
        },
        "ImageURL": 'https://www.imdb.com/title/tt0371746/mediaviewer/rm1544850432/?ref_=tt_ov_i',
        "Featured": 'false'
    },
    {
        "Title": 'The Lion King',
        "Description": 'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.',
        "Genre": {
            "Name": 'Animation',
            "Genre Description": 'Animation is a method by which still figures are manipulated to appear as moving images. In traditional animation, images are drawn or painted by hand on transparent celluloid sheets to be photographed and exhibited on film. Today, many animations are made with computer-generated imagery (CGI). Computer animation can be very detailed 3D animation, while 2D computer animation (which may have the look of traditional animation) can be used for stylistic reasons, low bandwidth, or faster real-time renderings. Other common animation methods apply a stop motion technique to two- and three-dimensional objects like paper cutouts, puppets, or clay figures.',
        },
        "Director": {
            "Name": 'Roger Allers',
            "Bio": "Roger Allers is an American animated film director and writer who is known for co-directing the influential 1994 Disney musical film The Lion King. He also worked on Beauty and the Beast, Aladdin and The Little Mermaid. He was intended to direct the musical drama Kingdom of the Sun, which got retooled into the 2000 comedy The Emperor's New Groove."
        },
        "Director": {
            "Name": 'Rob Minkoff',
            "Bio": "Rob Minkoff was born on 11 August 1962 in Palo Alto, California, USA. He is a producer and director, known for The Lion King (1994), Stuart Little 2 (2002) and The Haunted Mansion (2003). He has been married to Crystal Kung Minkoff since 29 September 2007."
        },

        "ImageURL": 'https://www.imdb.com/title/tt0110357/mediaviewer/rm3272938240/?ref_=tt_ov_i',
        "Featured": 'false',
    }
];

// //Delete user
// app.delete('/users/:id', (req, res) => {
//     const { id } = req.params; 
//     let user = users.find(user => user.id == id);

//     if (user) {
//         users = users.filter(user => user.id != id)
//         res.status(200).send(`User ${id} has been deleted.`);
//     } else {
//         res.status(400).send(`User ${id} was not in the system.`);
//     }
// });
//Post new movie to users favorites
// app.post('/users/:id/:movieTitle', (req, res) => {
//     const { id, movieTitle } = req.params;
    
//     let user = users.find( user => user.id == id );

//     if (user) {
//         user.favoriteMovies.push(movieTitle);
//         res.status(200).send(`${movieTitle} has been added to id: ${id}'s array.`);
//     } else {
//         res.status(400).send('No such user exists.');
//     }
// });

//delete a specific movie from user favorites.
// app.delete('/users/:id/:movieTitle', (req, res) => {
//     const { id, movieTitle } = req.params; 
//     let user = users.find(user => user.id == id);

//     if (user) {
//         user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle)
//         res.status(200).send(`${movieTitle} has been removed from id: ${id}'s fovorite movies.`);
//     } else {
//         res.status(400).send(`${movieTitle} was not in id: ${id}'s favorite movies`);
//     }
// });

//Update user name
// app.put('/users/:id', (req, res) => {
//     const { id } = req.params;
//     const updatedUser = req.body
    
//     let user = users.find( user => user.id == id );

//     if (user) {
//         user.name = updatedUser.name;
//         res.status(200).json(user);
//     } else {
//         res.status(400).send('No such user exists.');
//     }
// });

//Read list of all movies
// app.get('/movies', (req, res) => {
//     res.status(200).json(movies);
// });

// //Read a specific movie
//  app.get('/movies/:title', (req, res) => {
//     const { title } = req.params;
//     const movie = movies.find( movie => movie.Title === title);

//     if (movie) {
//         res.status(200).json(movie);
//     } else {
//         res.status(400).send('No movie found');
//     };
//  });
//Get genre information
//  app.get('/movies/genre/:genreName', (req, res) => {
//     const { genreName } = req.params;
//     const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

//     if (genre) {
//         res.status(200).json(genre);                                //this could be repurposed to the phases of marvel
//     } else {
//         res.status(400).send('No genre found');
//     };
//  });
//Get director information
//  app.get('/movies/director/:directorName', (req, res) => {
//     const { directorName } = req.params;
//     const director = movies.find( movie => movie.Director.Name === directorName).Director;

//     if (director) {
//         res.status(200).json(director);
//     } else {
//         res.status(400).send('No director found');
//     };
//  });
//get movies a hero is in
//   app.get('/movies/Heroes/:Heroes', (req, res) => {
//     const { heroes } = req.params;
//     const movie = movies.find( movie => movie.heroes === heroes);

//     if (movie) {
//         res.status(200).json(movie);
//     } else {
//         res.status(400).send('No movie found with that hero');
//     };
//  });

//2.8 getting all users information(Most likely not needed)
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


//2.8 Add a hero to a movie while not allowing changes to the rest of the movie.
// app.post('/movies/:Title/:Hero', (req, res) => {
//     Movies.findOneAndUpdate({Title: req.params.Title}, {
//         $push: {Heroes: req.params.Hero}
//     }, 
//     { new: true },
//     (err, updatedHeroes) => {
//     if (err) {
//         console.error(err)
//         res.status(500).send(`Error: ${err}`);              //Better way to update heroes without allowing to update whole movie.
//     } else {
//         res.json(updatedHeroes);
//     }
//     });
// });

 //2.8 *(Adding a users favorite movies)
app.post('/users/:Username/movies/:Title', async (req, res) => {
    await Users.findOneAndUpdate({Username: (req.params.Username)}, {
        $push: {FavoriteMovies: req.params.Title}
    },
    { new: true })
    .then((updatedUser) => {
        res.json(updatedUser);                  //Running in to a BSONError
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
            return res.status(400).send(`${req.body.Username} 'already exists.`);
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
            res.status(400).send(req.params.Username + ' was not found.');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
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
        res.status(200).send(`${movie.Title} has been removed from our records`);     //not sure if this is needed
    } else {
        return res.status(404).send(`${req.params.Title} is not in our reccords`);
    }
})
    .catch((err) => {
        console.error(err); 
        res.status(500).send(`Error: ${err}`);
    });
});

//2.8 *Deleting a favorite movie from a users favorite movie array
app.delete('/users/:Username/:Title', (req, res) => {
    Users.findOneAndRemove({Username: req.params.Username})
    .then((user) => {
    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title = req.params.Title)
        res.status(200).send(`${Title} has been removed from ${Username}'s fovorite movies.`);  //Cannot show test until BSONError is fixed
    } else {
        res.status(400).send(`${Title} was not in ${Username}'s favorite movies`);
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
