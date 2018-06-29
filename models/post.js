const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// плагин для генерации ЧПУ
const URLSlugs = require('mongoose-url-slugs');
// для транслитерации текста
const tr = require('transliter');

// делаем ссылку на id User'а, который создаёт пост
const schema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    body: {
      type: String
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Создаём дополнительное поле url для передачи в ссылку (создаёт уникальные названия по умолчанию)
schema.plugin(
  URLSlugs('title', {
    field: 'url',
    generator: text => tr.slugify(text)
  })
);

schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Post', schema);
