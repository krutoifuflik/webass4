import express from 'express';

const viewsController  = express.Router();

viewsController.get('/', (req, res) => {
    res.render('index');
});

viewsController.get('/graphs/1', (req, res) => {
    res.render('graphs-1');
});

viewsController.get('/graphs/2', (req, res) => {
    res.render('graphs-2');
});

viewsController.get('/graphs/3', (req, res) => {
    res.render('graphs-3');
});

export default viewsController;