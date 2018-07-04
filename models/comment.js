// модель для таблицы комментариев
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// рекурсивное наполнение объекта
const autopopulate = require('mongoose-autopopulate');
// вызываем модель поста
const Post = require('./post');

const schema = new Schema(
  {
    body: {
      type: String,
      required: true
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    parent: {
      // будет хранить родительский id, усли есть
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: true
    },
    children: [
      // содержит ссылку на самого себя - такие же комменты
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
        autopopulate: true
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// обращение к статической функции родительского поста
schema.pre('save', async function(next) {
  // исполнится только 1 раз
  if (this.isNew) {
    await Post.incCommentCount(this.post);
  }
  next();
});

// подключаем рекурсивное наполнение
schema.plugin(autopopulate);

schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Comment', schema);
