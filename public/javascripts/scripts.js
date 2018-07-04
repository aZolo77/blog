/* eslint-disable no-undef*/
$(function() {
  // функция удаления ошибочно-заполненных полей
  function removeErrors() {
    $('form.login p.error, form.register p.error').remove();
    $('.login input, .register input').removeClass('error');
  }
  // toggle form
  var flag = true;
  $('.switch-button').on('click', function(e) {
    e.preventDefault();

    // обнуляем значения, введённые хомяком и убираем класс error
    $('.login input, .register input').val('');
    removeErrors();

    if (flag) {
      flag = false;
      $('.register').show('slow');
      $('.login').hide();
    } else {
      flag = true;
      $('.login').show('slow');
      $('.register').hide();
    }
  });

  // убираем сообщение об ошибке при фокусе на инпутах
  $('form.login input, form.register input').on('focus', function() {
    removeErrors();
  });

  // регистрация пользователя
  $('.register-button').on('click', function(e) {
    e.preventDefault();

    // убираем класс error при отправке данных
    removeErrors();

    // создаём объект из вводимых пользователем данных
    var data = {
      login: $('#register-login').val(),
      password: $('#register-password').val(),
      passwordConfirm: $('#register-password-confirm').val()
    };

    // отпавляем данные на сервер
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/auth/register'
    }).done(function(data) {
      // если "что то пошло не так" выводим сообщение об ошибке
      if (!data.ok) {
        $('form.login p.error, form.register p.error').remove();
        var errorMsg = '<p class="error">' + data.error + '</p>';
        $('.register h2').after(errorMsg);
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('input[name=' + item + ']').addClass('error');
          });
        }
      } else {
        // если всё ок - перезагружаем страничку
        $(location).attr('href', '/');
        // $('.register h2').after('<p class="success">Отлично!</p>');
      }
    });
  });

  // авторизация пользователя
  $('.login-button').on('click', function(e) {
    e.preventDefault();

    // убираем класс error при отправке данных
    removeErrors();

    // создаём объект из вводимых пользователем данных
    var data = {
      login: $('#login-login').val(),
      password: $('#login-password').val()
    };

    // отпавляем данные на сервер
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/api/auth/login'
    }).done(function(data) {
      // если "что то пошло не так" выводим сообщение об ошибке
      if (!data.ok) {
        $('form.login p.error, form.register p.error').remove();
        var errorMsg = '<p class="error">' + data.error + '</p>';
        $('.login h2').after(errorMsg);
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('input[name=' + item + ']').addClass('error');
          });
        }
      } else {
        // если всё ок - перезагружаем страничку
        $(location).attr('href', '/');
        // $('.login h2').after('<p class="success">Отлично!</p>');
      }
    });
  });
});
/* eslint-enable no-undef*/

/* eslint-disable no-undef*/
// загрузка новых постов и картинок
$(function() {
  // функция удаления ошибочно-заполненных полей
  function removeErrors() {
    $('.post-form p.error').remove();
    $('.post-form input, #post-body').removeClass('error');
  }

  // убираем сообщение об ошибке при фокусе на инпутах
  $('.post-form input, #post-body').on('focus', function() {
    removeErrors();
  });

  // добавление нового поста в БД
  $('.publish-button').on('click', function(e) {
    e.preventDefault();
    removeErrors();

    var data = {
      title: $('#post-title').val(),
      body: $('#post-body').val()
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/post/add'
    }).done(function(data) {
      if (!data.ok) {
        // если есть незаполненные поля
        $('.post-form p.error').remove();
        var errorMsg = '<p class="error">' + data.error + '</p>';
        $('.post-form h2').after(errorMsg);
        if (data.fields) {
          data.fields.forEach(function(item) {
            $('#post-' + item).addClass('error');
          });
        }
      } else {
        $(location).attr('href', '/');
      }
    });
  });

  // upload files
  $('#fileinfo').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this); // конструирует объект из полей формы

    $.ajax({
      type: 'POST',
      url: '/upload/image',
      data: formData,
      processData: false, // не отправляет лишние данные
      contentType: false,
      success: function(r) {
        console.log(r);
      },
      error: function(e) {
        console.log(e);
      }
    });
  });
});
/* eslint-enable no-undef*/

/* eslint-disable no-undef*/
$(function() {
  // новая форма
  var commentForm;
  // id parent-comment
  var parentId;

  // функция добавления формы
  function form(isNew, comment) {
    $('.reply').show();

    // убирать лишние клоны формы
    if (commentForm) {
      commentForm.remove();
    }
    // обнуляем id родительского комментария
    parentId = null;

    commentForm = $('form.comment').clone(true, true); // клонируем форму со свеми handler'ами

    // если это родительский комментарий
    if (isNew) {
      commentForm.find('.cancel').hide();
      commentForm.appendTo('.comment-list');
    } else {
      // берём id родительского комментария
      var parentComment = $(comment).parent();
      parentId = parentComment.attr('id');
      // вставляем форму после родительского комментария
      $(comment).after(commentForm);
    }

    commentForm.css({ display: 'flex' });
  }

  // load form
  form(true);

  // add form
  $('.reply').on('click', function() {
    form(false, this);
    // скрыть надпись 'Ответить'
    $(this).hide();
  });

  // отмена добавления комментария
  $('form.comment .cancel').on('click', function() {
    e.preventDefault();
    commentForm.remove();
    // load form
    form(true);
  });

  // добавление комментариев
  $('form.comment .send').on('click', function(e) {
    e.preventDefault();
    // removeErrors();

    var data = {
      post: $('.comments').attr('id'),
      body: commentForm.find('textarea').val(),
      parent: parentId
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/comment/add'
    }).done(function(data) {
      if (!data.ok) {
        // если нет родительского комментария и не заполнено поле textarea
        if (data.error === undefined) {
          data.error = 'неизвестная ошибка!';
        }
        $(commentForm).prepend('<p class="error">' + data.error + '</p>');
      } else {
        // вставить новый комментарий без перезагрузки страницы
        var newComment = `<ul>
                            <li style="background-color: #ffffe0;">
                              <div class="head">
                                <a href="/users/${data.login}">
                                  ${data.login}
                                </a>
                                <span class="date">
                                  Только что
                                </span>
                              </div>
                              ${data.body}
                            </li>
                          </ul>`;
        $(commentForm).after(newComment);
        form(true);
      }
    });
  });
});
/* eslint-enable no-undef*/
