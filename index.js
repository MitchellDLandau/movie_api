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