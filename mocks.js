// плагин для перебора массивов и генерации html
const faker = require('faker');

// плагин для конвертации html тегов
const TurndownService = require('turndown');

// мои скрипты
const models = require('./models');

const owner = '5b3645001d61f27a0dbe8e16';

module.exports = () => {
  models.Post.remove()
    .then(() => {
      // .from() перебирает массив
      Array.from({ length: 20 }).forEach(() => {
        const turndownService = new TurndownService();

        models.Post.create({
          title: faker.lorem.words(5), // генерирует 5 слов рыбного текста
          body: turndownService.turndown(faker.lorem.words(100)), // генерирует 100 слов рыбного текста
          owner
        })
          .then(console.log)
          .catch(console.log);
      });
    })
    .catch(console.log);
};
