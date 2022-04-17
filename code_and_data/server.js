"use strict"
/* Serveur pour le site de recettes */
var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();
// parse form arguments in POST requests
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


const cookieSession = require('cookie-session');
app.use(cookieSession({
secret: 'mot-de-passe-du-cookie',
}));

 // to verify if user is authenticated

app.use(function(req, res , next){
  // console.log("000"); 
  // res.locals.authenticated = false;
  if(req.session.name!=undefined){
    res.locals.name = req.session.name;
    res.locals.authenticated = true;
    // console.log("aaaa");
  }
  else{
    res.locals.authenticated = false;
    // console.log("bbb");
  }
  // console.log("ccc");
  next();
}) 

/**** Routes pour voir les pages du site ****/

/* Retourne une page principale avec le nombre de recettes */
app.get('/', (req, res) => {
  res.render('index');
});

/* Retourne les résultats de la recherche à partir de la requête "query" */
app.get('/search', (req, res) => {
  var found = model.search(req.query.query, req.query.page);
  res.render('search', found);
});

/* Retourne le contenu d'une recette d'identifiant "id" */
app.get('/read/:id', (req, res) => {
  var entry = model.read(req.params.id);
  res.render('read', entry);
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.get('/update/:id', (req, res) => {
  var entry = model.read(req.params.id);
  res.render('update', entry);
});

app.get('/delete/:id', (req, res) => {
  var entry = model.read(req.params.id);
  res.render('delete', {id: req.params.id, title: entry.title});
});

// Retourne la page du login question 3.4:3
app.get('/login', (req, res) => {
  res.render('login');
});

 // question 3.5;3
 app.get('/new_user', (req, res) => {
  res.render('new_user');
});

/**** Routes pour modifier les données ****/

// Fonction qui facilite la création d'une recette
function post_data_to_recipe(req) {
  return {
    title: req.body.title, 
    description: req.body.description,
    img: req.body.img,
    duration: req.body.duration,
    ingredients: req.body.ingredients.trim().split(/\s*-/).filter(e => e.length > 0).map(e => ({name: e.trim()})),
    stages: req.body.stages.trim().split(/\s*-/).filter(e => e.length > 0).map(e => ({description: e.trim()})),
  };
}

app.post('/create', (req, res) => {
  var id = model.create(post_data_to_recipe(req));
  res.redirect('/read/' + id);
});

app.post('/update/:id', (req, res) => {
  var id = req.params.id;
  model.update(id, post_data_to_recipe(req));
  res.redirect('/read/' + id);
});

app.post('/delete/:id', (req, res) => {
  model.delete(req.params.id);
  res.redirect('/');
}); 

//question 3.4:4
app.post('/login' ,(req, res) => {
  let id=model.login(req.body.name,req.body.password)
  //console.log(model.login(req.body.name,req.body.password))
  if(model.login(req.body.name,req.body.password)!=-1){
    req.session.id = model.login(req.body.name,req.body.password);
    req.session.name = req.body.name;
    res.redirect('/');
  }
  else{
      res.redirect('/login');
  }

}); 

//question 3.4:5
app.post('/logout' ,(req, res) => {
  req.session = null;
  res.redirect('/');

}); 

//question 3.5;4
app.post('/new_user',(req,res)=>{
  model.new_user(req.body.name, req.body.password);
  res.redirect('/');
})



app.listen(3000, () => console.log('listening on http://localhost:3000')); 