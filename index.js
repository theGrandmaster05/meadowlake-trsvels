let express = require('express');
let app = express();
let handlebars = require('express3-handlebars').create({ defaultLayout: 'main'});
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let path = `${__dirname}/public`;
let flash = require('connect-flash');
let passport = require('passport');
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});

app.disable('x-powered-by');
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'supersecret', resave: false, saveUninitialized: false}));
app.use(csrfProtection);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path));
app.use('/user',express.static(path));
app.use('/product',express.static(path));
app.set('port', process.env.PORT || 4000);

//models
let Product = require('./models/product');

mongoose.connect('mongodb://localhost/fabrixrus', { useNewUrlParser:true })
    .then(() => {
        console.log('Connected to FabrixRus');
    })
    .catch((err) => {
        console.warn(err);
});
require('./config/passport');
app.get('/', (req,res) => {
    Product.find((err,data) => {
        res.render('home',{ title: 'Home', products: data });
    })
    .catch(err => { console.warn(`The following error occurred: ${err}`);});
});

app.get('/about', (req,res) => {
    res.render('about',{
        pageTestScript : '/qa/tests-about.js',
        title: 'About Us'
    });
});
app.get('/contact', (req,res) => {
    res.render('contact', {
        title: 'Contact Us'
    });
});

app.get('/user/login', (req,res) => {
    res.render('user/login', {
        title: 'Login'
    });
});

app.get('/profile', (req,res,next) => {
   res.render('profile');
});

app.get('/product/single', (req,res) => {
    res.render('products/single', {
        title: 'Aso - Oke'
    });
});

app.get('/user/register', (req,res,next) => {
    res.render('user/signup',{
        title: 'Register',
        csrfToken: req.csrfToken()
    });
});
// (req,res) => {
//     console.log(`Form sender email is ${req.body.email}`);
//     console.log(`Form csrf token is ${req.body._csrf}`);
//     console.log(`Form user password is ${req.body.password}`);
//     res.redirect(303,'/');
app.post('/user/register', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true,
}));

app.get('/products', (req,res) => {
    res.render('products',{
        title: 'Products'
    });
});
//custom 404 page
app.use((req,res) => {
    res.render('404',{
        title: 'Page Not Found'
    });
    res.status(404);
});

//custom error 500 page
app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500);
    res.render('500', {
        title: 'Internal server error'
    });
});

app.listen(app.get('port'), () => {
    console.log(`Express started on localhost:${app.get('port')}; press ctrl - C to terminate`)
});