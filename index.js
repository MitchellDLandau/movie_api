const express = require ('express');
morgan = require('morgan');
const app = express();


let movies = [
    {
        name: 'Avengers Endgame'
    },
    {
        name: 'Captain America the Winter Soldier'
    },
    {
        name: 'Harry potter'
    },
    {
        name: 'Ready Player One'
    },
    {
        name: 'Django Unchained'
    },
    {
        name: 'Avatar'
    },
    {
        name: 'Apollo 11'
    },
    {
        name: 'Black Panther'
    },
    {
        name: 'The Dark Knight'
    },
    {
        name: 'The Italian Job'
    }
];

app.use(morgan('common'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status('500').send('an error occured!')
});

app.get('/', (req,res) => {
    res.send("We've got the movies!!!");
})

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.use(express.static('public'));

app.listen(8080, () => {
    console.log('app running on port 8080.');
});