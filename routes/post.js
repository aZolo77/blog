const express = require('express');
const router = express.Router();
// плагин для конвертации html тегов
const TurndownService = require('turndown');

// подключаем Модели
const models = require('../models');

// выводит шаблон из views при переходе по данному пути
router.get('/add', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    // использовать шаблон из views
    res.render('post/add', {
      // передать id  login сессии, если они есть
      user: {
        id: userId,
        login: userLogin
      }
    });
  }
});

// обработка добавления поста
router.post('/add', (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  // Если пользак не зарегистрирован, то посылаем его на главную
  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    // берём заголовок и тело поста
    const title = req.body.title.trim().replace(/ +(?= )/g, ''); // убирает все пробелы в начале и конце заголовка
    const body = req.body.body;
    // для конвертации html тегов
    const turndownService = new TurndownService();

    if (!title || !body) {
      // подсвечиваем только те поля, которые не заполнены
      const fields = [];
      if (!title) fields.push('title');
      if (!body) fields.push('body');

      res.json({
        ok: false,
        error: 'Все поля должны быть заполнены',
        fields: fields
      });
    } else if (title.length > 64) {
      // длины логина
      res.json({
        ok: false,
        error: 'Длина заголовка не должна превышать 64 символа!',
        fields: ['title']
      });
    } else if (body.length > 100) {
      // длины логина
      res.json({
        ok: false,
        error: 'Длина комментария не должна превышать 1000 символов!',
        fields: ['body']
      });
    } else {
      // добавляем пост в БД
      models.Post.create({
        title,
        body: turndownService.turndown(body),
        owner: userId
      })
        .then(post => {
          console.log(post);
          res.json({
            ok: true
          });
        })
        .catch(err => {
          console.log(err);
          res.json({
            ok: false,
            error: 'Ошибка, попробуйте позже!'
          });
        });
    }
  }
});

module.exports = router;
