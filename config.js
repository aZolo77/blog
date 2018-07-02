const dotenv = require('dotenv');
const path = require('path');

const root = path.join.bind(this, __dirname);
dotenv.config({ path: root('.env') });

// файл для основных настроек БД, порта и т.д.
// облачная БД {https://mlab.com/}
// графический редактор для работы с MongoDB {https://robomongo.org/}
module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  IS_PRODUCTION: process.env.NODE_INV === 'production',
  PER_PAGE: process.env.PER_PAGE
};
