const express = require('express');
const router = express.Router();

// подключаем Модели
const models = require('../models');

// выводит шаблон из views при переходе по данному пути
router.get('/add', (req, res) => {
  const id = req.session.userId;
  const login = req.session.userLogin;
  // использовать шаблон из views
  res.render('post/add', {
    // передать id  login сессии, если они есть
    user: {
      id,
      login
    }
  });
});

// обработка добавления поста
router.post('/add', (req, res) => {
  // берём заголовок и тело поста
  const title = req.body.title.trim().replace(/ +(?= )/g, ''); // убирает все пробелы в ачале и конце заголовка
  const body = req.body.body;

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
      body
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
});

module.exports = router;
