// модель для загрузки фото
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    path: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false
  }
);

schema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Upload', schema);