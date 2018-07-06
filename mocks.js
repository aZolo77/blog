// плагин для перебора массивов и генерации html
const faker = require('faker');
const tr = require('transliter');

// мои скрипты
const models = require('./models');

const owner = '5b3645001d61f27a0dbe8e16';

// для перезаписи всех постов в БД
module.exports = async () => {
  try {
    await models.Post.remove();
    Array.from({ length: 20 }).forEach(async () => {
      // генерирует 5 слов рыбного текста
      const title = faker.lorem.words(5);
      const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;
      const post = await models.Post.create({
        title,
        body: faker.lorem.words(100), // генерирует 100 слов рыбного текста
        url,
        owner
      });
      console.log(post);
    });
  } catch (error) {
    console.log(error);
  }
};
