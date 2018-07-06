const express = require('express');
const router = express.Router();
const tr = require('transliter');

// подключаем Модели
const models = require('../models');

// редактирование поста
router.get('/edit/:id', async (req, res, next) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const id = req.params.id.trim().replace(/ +(?= )/g, '');

  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    try {
      const post = await models.Post.findById(id); // ищем пост в БД

      if (!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      }
      // использовать шаблон из views
      res.render('post/edit', {
        post,
        // передать id и login сессии, если они есть
        user: {
          id: userId,
          login: userLogin
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
});

// выводит шаблон из views при переходе по данному пути
router.get('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    try {
      // если есть черновик залогиненного пользователя, то перенаправляем на страницу редактирования
      const post = await models.Post.findOne({
        owner: userId,
        status: 'draft'
      });

      if (post) {
        res.redirect(`/post/edit/${post.id}`);
      } else {
        // если черновика нет - создаём его
        const post = await models.Post.create({
          owner: userId,
          status: 'draft'
        });
        res.redirect(`/post/edit/${post.id}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
});

// обработка добавления поста
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  // Если пользак не зарегистрирован, то посылаем его на главную
  if (!userId || !userLogin) {
    res.redirect('/');
  } else {
    // берём заголовок и тело поста
    const title = req.body.title.trim().replace(/ +(?= )/g, ''); // убирает все пробелы в начале и конце заголовка
    const body = req.body.body.trim();
    // черновик или нет
    const isDraft = !!req.body.isDraft;
    const postId = req.body.postId;
    const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;

    if (!title || !body) {
      // подсвечиваем только те поля, которые не заполнены
      const fields = [];
      if (!title) fields.push('title');
      if (!body) fields.push('body');

      res.json({
        ok: false,
        error: 'Все поля должны быть заполнены!',
        fields
      });
    } else if (title.length > 64) {
      // длины логина
      res.json({
        ok: false,
        error: 'Длина заголовка не должна превышать 64 символа!',
        fields: ['title']
      });
    } else if (body.length > 2000) {
      // длина текста поста
      res.json({
        ok: false,
        error: 'Длина комментария не должна превышать 2000 символов!',
        fields: ['body']
      });
    } else if (!postId) {
      // определение статуса поста (редактируемый или нет)
      res.json({
        ok: false
      });
    } else {
      try {
        const post = await models.Post.findOneAndUpdate(
          {
            _id: postId,
            owner: userId
          },
          {
            title,
            body,
            url,
            owner: userId,
            status: isDraft ? 'draft' : 'published'
          },
          { new: true } // возвращает пост после обновления
        );

        if (!post) {
          res.json({
            ok: false,
            error: 'Пост не твой!'
          });
        } else {
          res.json({
            ok: true,
            post
          });
        }
      } catch (error) {
        res.json({
          ok: false,
          error: 'Ошибка, попробуйте позже!'
        });
      }
    }
  }
});

module.exports = router;
