// 25 Tutorial {https://www.youtube.com/watch?v=X9RAU33Vu5M&index=25&list=PL_RVw8KXnKnP_8vWPmXq3Vrnj25tkf-5p}
// [Time: 00:00] : функция редактирования постов
// Github page: {https://github.com/pepelatz/pepelatz/tree/video_25}

// === Плагины ===
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const staticAsset = require('static-asset');
// плагин для работы с БД MongoDB
const mongoose = require('mongoose');
// плагины для работы с сессиями
const session = require('express-session'); // {https://github.com/expressjs/session}
const MongoStore = require('connect-mongo')(session); // {https://github.com/jdesboeufs/connect-mongo}

// == пути до user-files ==
const config = require('./config');
const routes = require('./routes');

// database
mongoose.Promise = global.Promise;
mongoose.set('debug', config.IS_PRODUCTION);

// подключение к БД
mongoose.connection
  .on('error', error => console.error(error))
  .on('close', () => console.log('Database connection closed.'))
  .once('open', () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}: ${info.port}/${info.name}`);

    // плагин для генерации fake-постов
    // require('./mocks')();
  });

mongoose.connect(config.MONGO_URL);

// express init
const app = express();

// sessions
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

// использовать шаблонизатор ejs {http://ejs.co/}
app.set('view engine', 'ejs');

// использовать body-parser для декодирования url, json, post-запросов и т.д.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// плагин для добавления хэшей перед ссылками на скрипты и стили
app.use(staticAsset(path.join(__dirname, 'public')));

// используем статические файлы
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/javascripts',
  express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist'))
);

// === routers ===
// пагинация
app.use('/', routes.archive);
// registration
app.use('/api/auth', routes.auth);
app.use('/post', routes.post);
// comment
app.use('/comment', routes.comment);
// загрузка файлов
app.use('/upload', routes.upload);

// отдать 404 страницу ошибки
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  res.status(error.status || 505);
  res.render('error', {
    message: error.message,
    error: !config.IS_PRODUCTION ? error : {}
  });
});

app.listen(config.PORT, () => {
  console.log(`Port ${config.PORT} is listening`);
});
