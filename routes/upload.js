const express = require('express');
const router = express.Router();
const path = require('path');
// модуль для обработки файлов
const multer = require('multer');

// хранилище для файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // задаём путь, куда сохранять файлы
    cb(null, 'uploads'); // папка для загрузок [uploads]
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // добавляем расширение файлу
  }
});

// описываем параметры
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // размер не более 2Mb
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      const err = new Error('Extention');
      err.code = 'EXTENTION';
      return cb(err);
    }
    cb(null, true);
  }
}).single('file'); // загружаем только 1 файл [имя_поля]

// обработка добавления файла
router.post('/image', (req, res) => {
  // const userId = req.session.userId;
  // const userLogin = req.session.userLogin;

  upload(req, res, err => {
    let error = '';
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        error = 'Картинка не более 2Mb';
      }
      if (err.code === 'EXTENTION') {
        error = 'Только jpeg и png';
      }
    }
    res.json({
      ok: !error,
      error
    });
  });
});

module.exports = router;
