// скрипт для пагинации [посты, пользователи]
const express = require('express');
const router = express.Router();
// подлючаем конфиги
const config = require('../config');
// подключаем Модели
const models = require('../models');

// функция для показа постов
function showPosts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE; // кол-во постов на странице (3 по умолчанию)
  const page = req.params.page || 1; // номер страницы

  // выбираем все посты [skip - пропуск кол-ва постов]
  models.Post.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .populate('owner') // наполняем свойство owner {ref: 'User'}
    .sort({
      createdAt: -1 // обратная сортировка по дате добавления (чтобы сначала выводились новые посты)
    })
    .then(posts => {
      models.Post.count()
        .then(count => {
          res.render('archive/index', {
            // использовать шаблон из views
            posts,
            current: page,
            pages: Math.ceil(count / perPage),
            user: {
              // передать id  login сессии, если они есть для sidebar
              id: userId,
              login: userLogin
            }
          });
        })
        .catch(() => {
          throw new Error('Server error');
        });
    })
    .catch(() => {
      throw new Error('Server error');
    });
}

// главная
router.get('/', (req, res) => showPosts(req, res));
// страницы со старыми постами
router.get('/archive/:page', (req, res) => showPosts(req, res));
// страница конкретного поста
router.get('/posts/:post', (req, res, next) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const url = req.params.post.trim().replace(/ +(?= )/g, ''); // убирает все пробелы в начале и конце

  // если не введено ничего в качестве /:post - выводим ошибку
  if (!url) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  } else {
    models.Post.findOne({
      url
    })
      .then(post => {
        // если не существует такого url в БД - выводим ошибку
        if (!post) {
          const err = new Error('Not Found');
          err.status = 404;
          next(err);
        } else {
          res.render('post/post', {
            // использовать шаблон из views
            post,
            user: {
              // передать id  login сессии, если они есть для sidebar
              id: userId,
              login: userLogin
            }
          });
        }
      })
      .catch(console.log);
  }
});

// users posts
// опциональный параметр page*?
router.get('/users/:login/:page*?', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE; // кол-во постов на странице (3 по умолчанию)
  const page = req.params.page || 1; // номер страницы
  const login = req.params.login; // номер страницы

  // ищем пользователя с данным login
  models.User.findOne({
    login
  })
    .then(user => {
      // выбираем все посты [skip - пропуск кол-ва постов]
      models.Post.find({
        owner: user.id // post.owner == user.id
      })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate('owner')
        .sort({
          createdAt: -1
        })
        .then(posts => {
          models.Post.count({
            owner: user.id
          })
            .then(count => {
              res.render('archive/user', {
                // использовать шаблон из views
                posts,
                current: page,
                pages: Math.ceil(count / perPage),
                user: {
                  // передать id  login сессии, если они есть для sidebar
                  id: userId,
                  login: userLogin
                }
              });
            })
            .catch(() => {
              throw new Error('Server error');
            });
        })
        .catch(() => {
          throw new Error('Server error');
        });
    })
    .catch(console.log);
});

module.exports = router;
