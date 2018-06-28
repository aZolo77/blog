const express = require('express');
const router = express.Router();
// шифрование паролей {https://www.npmjs.com/package/bcrypt}
const bcrypt = require('bcrypt-nodejs');

// подключаем Модели
const models = require('../models');

// Регистрация
router.post('/register', (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  // [проверка] ok: true/false, error: error-message, fields: какие поля подсветить
  if (!login || !password || !passwordConfirm) {
    // подсвечиваем только те поля, которые не заполнены
    const fields = [];
    if (!login) fields.push('login');
    if (!password) fields.push('password');
    if (!passwordConfirm) fields.push('passwordConfirm');

    res.json({
      ok: false,
      error: 'Все поля должны быть заполнены',
      fields: fields
    });
  } else if (!/^[a-zA-Z0-9]+$/.test(login)) {
    // только латиница и цифры
    res.json({
      ok: false,
      error: 'Только латинские буквы и цифры!',
      fields: ['login']
    });
  } else if (login.length < 3 || login.length > 16) {
    // длины логина
    res.json({
      ok: false,
      error: 'Длина логина от 3 до 16 символов!',
      fields: ['login']
    });
  } else if (password != passwordConfirm) {
    // не совпадают пароли
    res.json({
      ok: false,
      error: 'Пароли не совпадают!',
      fields: ['password', 'passwordConfirm']
    });
  } else if (password.length < 3 || password.length > 10) {
    // короткий/длинный пароль
    res.json({
      ok: false,
      error: 'Длина пароля от 3 до 10 символов!',
      fields: ['password']
    });
  } else {
    // Проверка на User с таким же логином
    models.User.findOne({
      login
    }).then(user => {
      if (!user) {
        // записываем в БД нового User (шифруем пароль)
        bcrypt.hash(password, null, null, function(err, hash) {
          models.User.create({
            login,
            password: hash
          })
            .then(user => {
              // создаём сессию
              req.session.userId = user.id;
              req.session.userLogin = user.login;
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
        });
      } else {
        res.json({
          ok: false,
          error: 'Имя занято!',
          fields: ['login']
        });
      }
    });
  }
});

// Вход в аккаунт (Авторизация)
router.post('/login', (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  if (!login || !password) {
    // подсвечиваем только те поля, которые не заполнены
    const fields = [];
    if (!login) fields.push('login');
    if (!password) fields.push('password');

    res.json({
      ok: false,
      error: 'Все поля должны быть заполнены',
      fields: fields
    });
  } else {
    // ищем User по логину в БД
    models.User.findOne({
      login
    })
      .then(user => {
        // если не нашли User в БД
        if (!user) {
          res.json({
            ok: false,
            error: 'Логин и пароль не верны!',
            fields: ['login', 'password']
          });
        } else {
          // сверяем пароль и хэш из БД с помощью bcrypt
          bcrypt.compare(password, user.password, function(err, result) {
            if (!result) {
              res.json({
                ok: false,
                error: 'Логин и пароль не верны!',
                fields: ['login', 'password']
              });
            } else {
              // создаём сессию
              req.session.userId = user.id;
              req.session.userLogin = user.login;
              res.json({
                ok: true
              });
            }
          });
        }
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

// выход из аккаунта
router.get('/logout', (req, res) => {
  // удалить объект сессии
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
