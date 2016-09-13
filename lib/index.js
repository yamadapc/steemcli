const Promise = require('bluebird');
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const slug = require('slug');
const steem = require('steem');

const parseOptions = require('./options');

Promise.promisifyAll(steem.broadcast);

function warn(log) {
  console.warn(log);
}

function info(log) {
  if (program.verbose) console.warn(log);
}

exports.commentAsync = function commentAsync(params) {
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
};

exports.run = async function run(options, inputFile) {
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
  info(JSON.stringify(_.extend(req, {
    wif: '**********'
  }), null, 2));
  info(chalk.magenta('-------------------------------------------------'));

  const result = await commentAsync(req);
  return `https://steemit.com/${req.parentPermalink}/@${req.author}/${req.permalink}`;
};

exports.main = function main() {
  const {program, input, options} = parseOptions();

  run(options, input).then((url) => {
    console.log(url);
    process.exit(0);
  }, (err) => {
    console.error(chalk.red('Error while creating post:'));
    console.error(err.message || JSON.stringify(err, null, 2));
    process.exit(1);
  });
};
