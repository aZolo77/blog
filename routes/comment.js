const express = require('express');
const router = express.Router();

// подключаем Модели
const models = require('../models');

// обработка добавления поста
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  // Если пользак не зарегистрирован, то посылаем его на главную
  if (!userId || !userLogin) {
    res.json({
      ok: false
    });
  } else {
    // id поста, текст комментария, родительский элемент
    const post = req.body.post;
    const body = req.body.body;
    const parent = req.body.parent;

    // если не передали тект комментария
    // if (!body) {
    //   res.json({
    //     ok: false,
    //     error: 'пустой комментарий'
    //   });
    // }

    try {
      if (!parent) {
        await models.Comment.create({
          post,
          body,
          owner: userLogin
        });
        // передаём данные в jquery
        res.json({
          ok: true,
          body,
          login: userId
        });
      } else {
        // если есть id родительского комментария в БД
        const parentComment = await models.Comment.findById(parent);
        if (!parentComment) {
          res.json({
            ok: false
          });
        }
        // создаём в БД комментарий с полем для id родительского комментария
        const comment = await models.Comment.create({
          post,
          body,
          parent,
          owner: userId
        });

        // добавляем в родительский комментарий массив из всех дочерних
        const children = parentComment.children;
        children.push(comment.id);
        parentComment.children = children;
        // сохранение модели родительского комментария (update)
        await parentComment.save();
        // передаём данные в jquery
        res.json({
          ok: true,
          body,
          login: userLogin
        });
      }
    } catch (err) {
      res.json({
        ok: false
      });
    }
  }
});

module.exports = router;
