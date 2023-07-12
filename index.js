const express = require ('express');
    app = express();
    bodyParser = require ('body-parser');
    uuid = require ('uuid');

    app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: "Madi Stonewall",
        favoriteMovies: ["Lion King"]
    },
    {
        id: "2",
        name: "Mitchell Landau",
        favoriteMovies: ["Iron Man"]
    },
    {
        id: "3",
        name: "Loki Bean",
        favoriteMovies: ["dog"]
    }

];

let movies = [
    {
        "Title": 'Iron Man',
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

//Create a new user
app.post('/users', (req, res) => {
    const newUser = req.body

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(200).send('The user ' + newUser.name + ' has been added to the system, their id number is ' + newUser.id);
        console.log('The new users ID is ' + newUser.id);

    } else {
        res.status(400).send('users need names');
    }
});

//Delete user
app.delete('/users/:id', (req, res) => {
    const { id } = req.params; 
    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter(user => user.id != id)
        res.status(200).send(`User ${id} has been deleted.`);
    } else {
        res.status(400).send(`User ${id} was not in the system.`);
    }
});
//Post new movie to users favorites
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    
    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to id: ${id}'s array.`);
    } else {
        res.status(400).send('No such user exists.');
    }
});

//delete a specific movie from user favorites.
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; 
    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle)
        res.status(200).send(`${movieTitle} has been removed from id: ${id}'s fovorite movies.`);
    } else {
        res.status(400).send(`${movieTitle} was not in id: ${id}'s favorite movies`);
    }
});

//Update user name
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body
    
    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('No such user exists.');
    }
});

//Read list of all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//Read a specific movie
 app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No movie found');
    };
 });
//Get genre information
 app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No genre found');
    };
 });
//Get director information
 app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No director found');
    };
 });

  app.get('/movies/:Heroes', (req, res) => {
    const { heroes } = req.params;
    const movie = movies.find( movie => movie.heroes === heroes);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No movie found with that hero');
    };
 });

 app.get('')

app.listen(8080, () => {
    console.log('app running on port 8080.');
});
