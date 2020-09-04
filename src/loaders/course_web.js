const last= require('lodash/last');
const { requirejs } = require('../utils/types');
const Path = require('path');
const fs = require('fs');

const set = new Set(['ar', 'en', 'es', 'id', 'th', 'tw'])

const locales = fs
  .readdirSync('../course_web/rtl/www/common/nls', { withFileTypes: true })
  .filter((it) => it.isDirectory())
  .map((it) => it.name).filter(it => set.has(it));

module.exports = {
  project: 'course_web:nls',
  type: requirejs,
  localGlob: '../course_web/rtl/www/common/nls/**/*.js',
  remoteGlob: '**/2.0_*.js.json',
  fileMap: ['{locale}/{filename}', '{locale}/2.0_{filename}.json'],
  desc: ['{filename}', '2.0 {filename}'],
  localeMap: {
    templates: ''
  },
  localLocaleMap: {
    nls: 'templates'
  },
  needMerge: false,
  localParseAfter: function (file, obj) {
    if (last(Path.dirname(file.path).split(Path.sep)) === 'nls') {
      return obj.root;
    } else {
      return obj;
    }
  },
  remoteDeserialAfter: function (file, obj) {
    const seps = file.path.split(Path.sep);
    if (seps[seps.length - 2] === 'templates') {
      obj = {
        root: obj,
        ...locales.reduce((accu, curr) => {
          accu[curr] = true;
          return accu;
        }, {})
      };
    }
    return obj;
  }
};
