// скрипт для пагинации [посты, пользователи]
const express = require('express');
const router = express.Router();
// плагин для работы с датами
const moment = require('moment');
moment.locale('ru');
// подлючаем конфиги
const config = require('../config');
// подключаем Модели
const models = require('../models');

// функция для показа постов
async function showPosts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE; // кол-во постов на странице (3 по умолчанию)
  const page = req.params.page || 1; // номер страницы

  try {
    const posts = await models.Post.find({})
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('owner') // наполняем свойство owner {ref: 'User'}
      .sort({
        createdAt: -1 // обратная сортировка по дате добавления (чтобы сначала выводились новые посты)
      });
    const count = await models.Post.count(); // считаем кол-во постов в БД
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
  } catch (error) {
    throw new Error('Server error');
  }

  /*
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
    */
}

// главная
router.get('/', (req, res) => showPosts(req, res));
// страницы со старыми постами
router.get('/archive/:page', (req, res) => showPosts(req, res));
// страница конкретного поста
router.get('/posts/:post', async (req, res, next) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const url = req.params.post.trim().replace(/ +(?= )/g, ''); // убирает все пробелы в начале и конце

  // если не введено ничего в качестве /:post - выводим ошибку
  if (!url) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  } else {
    try {
      const post = await models.Post.findOne({ url });
      // если не существует такого url в БД - выводим ошибку
      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      } else {
        // ищем все комментарии данного поста
        const comments = await models.Comment.find({
          post: post.id,
          parent: { $exists: false } // выводим только комментарии, у которых нет родительских
        });

        res.render('post/post', {
          // использовать шаблон из views
          post,
          comments,
          moment,
          user: {
            // передать id  login сессии, если они есть для sidebar
            id: userId,
            login: userLogin
          }
        });
      }
    } catch (error) {
      throw new Error('Server error');
    }

    /*
    models.Post.findOne({
      url
    })
      .then(post => {
        if (!post) {
          const err = new Error('Not Found');
          err.status = 404;
          next(err);
        } else {
          res.render('post/post', {
            post,
            user: {
              id: userId,
              login: userLogin
            }
          });
        }
      })
      .catch(console.log);
      */
  }
});

// users posts
// опциональный параметр page*?
router.get('/users/:login/:page*?', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE; // кол-во постов на странице (3 по умолчанию)
  const page = req.params.page || 1; // номер страницы
  const login = req.params.login; // берём логин пользователя

  try {
    // ищем пользователя с данным login
    const user = await models.User.findOne({ login });
    // выбираем все посты [skip - пропуск кол-ва постов]
    const posts = await models.Post.find({
      owner: user.id // post.owner == user.id
    })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('owner')
      .sort({
        createdAt: -1
      });
    const count = await models.Post.count({ owner: user.id });
    res.render('archive/user', {
      // использовать шаблон из views
      posts,
      _user: user,
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        // передать id  login сессии, если они есть для sidebar
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server error');
  }

  /*
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
                _user: user,
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
    */
});

module.exports = router;
