const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const router = express.Router();
const mysql = require('mysql2');
const passport = require('passport');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const database = require('./db');
const crypto = require("crypto");
const loginRouter = require('./routes/login');
const cadastroRouter = require('./routes/cadastro');
const editarRouter = require('./routes/editar');
const cadastro = require('./routes/cadastro')
const lutadorRouter = require('./routes/lutadores');
const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const { isAsyncFunction } = require('util/types');
// Configuração do Express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const { promisify } = require('util');
//form



app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.join(__dirname, "views"));


app.use((req, res, next) => {
  res.locals.logado = false;
  next();
});





//CRUD


//session´s

app.use(session({
  secret: 'rogertrabaio',
  resave: false,
  saveUninitialized: true,

}));


const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Coloque a senha do seu banco de dados aqui
  database: 'node',
});


// Configuração de Sessão
const sessionStore = new MySQLStore({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  database: 'node',
});
app.use(session({
  store: sessionStore,
  secret: '2C44-4D44-WppQ38S', // Configure um segredo seu aqui
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 }, // 30 minutos
}));

// Configuração do Passport
require('./auth')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Rota para página inicial
app.get('/', (req, res) => {
  res.render('home');
});

// Rota para página inicial
app.get('/home', (req, res) => {
  res.render('home');
});

// Rota para o formulário (substitua pelo seu arquivo de modelo)
app.get('/formulario', (req, res) => {
  res.render('formulario'); // Substitua 'formulario' pelo nome do seu arquivo de modelo
});

//rota para cadastro de lutadores



// Middleware de autenticação personalizado
function authenticationMiddleware(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.imagem = req.session.passport.user.imagem;
    res.locals.logado = true;
    return next();

  }
  res.redirect('/login?erro=1');
}

// Roteadores
app.use('/login', loginRouter);
app.use('/cadastro', cadastroRouter);
app.use('/lutador', authenticationMiddleware, lutadorRouter);
app.use('/editar', authenticationMiddleware, editarRouter);

// Inicialização do banco de dados

app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


//CRUD

router.get('/', async (req, res) => {
  try {
    const [rows, fields] = await con.promise().query('SELECT * FROM lutadores');

    res.render('GerenciadorLutadores', { lutadores: rows });
  } catch (error) {
    console.error('Erro ao obter lutadores do banco de dados:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

router.post('/', (req, res) => {
  res.render('GerenciadorLutadores');
});


app.get('/inscricao', function (req, res) {
  res.render('formLutadores');
});


app.post('/inscricao', function (req, res) {
  var form = new formidable.IncomingForm();
  var nomeimg;


  form.parse(req, (err, fields, files) => {
    if (err) throw err;


    nomeimg = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
    var ext = path.extname(files.imagem[0].originalFilename);
    nomeimg += ext;
    const newpath = path.join(__dirname, "/public/imagens/", nomeimg);
    fs.rename(files.imagem[0].filepath, newpath, function (err) {
      var sql = "INSERT INTO lutadores (nome, nome_luta, idade, peso, imagem) VALUES ?";
      var values = [[fields['nome'][0], fields['nome_luta'][0], fields['idade'][0], fields['peso'][0], nomeimg]];

      con.query(sql, [values], function (err, result) {
        if (err) throw err;

        console.log("Número de registros inseridos: " + result.affectedRows);

        res.redirect('/lutador');
      });
    });
  });
});

app.get('/perfil', function (req, res) {
  res.render('perfil');
});
//=====================================================



app.get('/apagar/:id', function (req, res) {
  var id = req.params.id;
 
  // Busca o nome do arquivo e apaga ele
  con.query('SELECT * FROM lutadores where id=?', id, function (err, result, fields) {
     if (err) throw err;
     img = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
     const newpath = path.join(__dirname, "/public/imagens/", img);
     fs.unlink(img, (err) => {
     });
  });
 
  // Deleta o registro do banco de dados
  con.query('DELETE FROM lutadores WHERE id = ?', id, function (err, result) {
     if (err) throw err;
  });
 
  res.redirect('/lutador');
 });

//editar




  (async () => {
    try {
      const resultado = await database.sync();
    } catch (error) {
      console.log(error);
    }
  })();


// Iniciar servidor
const server = app.listen(port, () => {
  console.log('Exemplo de aplicação escutando em http://localhost:' + port);
});
