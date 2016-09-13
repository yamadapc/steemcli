const Promise = require('bluebird');
const _ = require('lodash');
const chalk = require('chalk');
const steem = require('steem');

const parseOptions = require('./options');
const {warn, info} = require('./log');

Promise.promisifyAll(steem.broadcast);

exports.commentAsync = commentAsync;
exports.main = main;
exports.run = run;

function commentAsync(params) {
  const {
    wif,
    parentAuthor,
    parentPermalink,
    author,
    permalink,
    title,
    body,
    meta
  } = params;

  return steem.broadcast.commentAsync(
    wif,
    parentAuthor,
    parentPermalink,
    author,
    permalink,
    title,
    body,
    meta
  ).then(() => {
    return params;
  }).catch((err) => {
    throw err;
  });
}

async function run(options, inputFile, filename) {
  const req = {
    wif: options.wif,
    parentAuthor: '',
    parentPermalink: options.parent,
    author: options.username,
    permalink: options.link,
    title: options.title,
    body: inputFile,
    meta: {
      theme: options.theme,
      filename,
      tags: [
        options.parent,
      ].concat(options.tags ? options.tags.split(',') : []),
    }
  };

  info(chalk.magenta('Payload: ----------------------------------------'));
  info(JSON.stringify(_.extend({}, req, {
    wif: '**********'
  }), null, 2));
  info(chalk.magenta('-------------------------------------------------'));

  if (options.watch) {
    warn(chalk.red('Not implemented!'));
    process.exit(1);
    return;
  }

  await commentAsync(req);
  return `https://steemit.com/${req.parentPermalink}/@${req.author}/${req.permalink}`;
}

function main() {
  const {filename, input, options} = parseOptions();

  run(options, input, filename).then((url) => {
    if (url) console.log(url);
    process.exit(0);
  }, (err) => {
    console.error(chalk.red('Error while creating post:'));
    console.error(err.message || JSON.stringify(err, null, 2));
    process.exit(1);
  });
}
