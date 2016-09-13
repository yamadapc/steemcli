const _ = require('lodash');
const chalk = require('chalk');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const slug = require('slug');
const steem = require('steem');

const packageJson = require('../package.json');
const { warn, info } = require('./log');

exports = module.exports = parseOptions;
exports.getDefaults = getDefaults;

/**
 * Post-processes options to get defaults
 */

function getDefaults(options, filename, input) {
  function getDefaultAuth(options) {
    if (options.wif) return;
    if (!options.username || !options.password) {
      console.error(chalk.red('Error:') + ' Please set --username, --password, --wip or\n' + 'the $STEEM_USERNAME and $STEEM_PASSWORD environment variables');
      process.exit(1);
    }
    info(chalk.blue('Info:') + ' Generating WIF token for posting');
    options.wif = steem.auth.toWif(options.username, options.password, 'posting');
  }

  function getDefaultParent(options) {
    if (!options.parent) {
      options.parent = 'steembin';
      info(chalk.blue('Info:') + ' Using ' + options.parent + ' as the parent');
    }
  }

  function getDefaultTitle(options) {
    if (!options.title) {
      options.title = path.basename(filename);
      info(chalk.blue('Info:') + ' Using ' + options.title + ' as the title');
    }
  }

  function getDefaultLink(options) {
    if (!options.link) {
      options.link = crypto.createHash('sha256').update(input).digest('hex');
      info(chalk.blue('Info:') + ' Using ' + options.link + ' as the permalink');
    }
  }

  function getDefaultDescription(options) {
    if (!options.desc) {
      options.desc = input.slice(0, 100);
      info(chalk.blue('Info:') + ' Using content start as the description');
    }
  }

  const fencedBlocks = {
    javascript: ['js', 'jsx'],
    html: ['html', 'xhtml'],
    php: ['php'],
    json: ['json'],
    haskell: ['haskell'],
    c: ['c', 'h'],
    cpp: ['cpp', 'hpp'],
    elisp: ['el']
  };
  const fencedBlocksData = _.map(fencedBlocks, (value, key) => {
    return { extensions: value, fence: key };
  });

  function postProcessInput() {
    const extname = path.extname(filename);
    if (['.markdown', '.md', '.txt', '.markd', ''].indexOf(extname) === -1 && !options.raw) {
      const bt = _.find(fencedBlocksData, ({ extensions }) => {
        return extensions.indexOf(extname.slice(1)) !== -1;
      });
      if (bt) {
        warn(chalk.yellow('Warning:') + ' Wrapping content in ```' + chalk.blue(bt.fence) + ' block, use --raw to bypass');
        let preinput = '';
        if (options.desc) preinput = options.desc + '\n\n';
        input = preinput + ('```' + bt.fence + '\n' + input + '\n```\n');
      }
    }
  }

  postProcessInput();
  getDefaultAuth(options);
  getDefaultParent(options);
  getDefaultTitle(options);
  getDefaultLink(options);
  getDefaultDescription(options);

  return { options, filename, input };
}

/**
 * Parses command-line options
 *
 * @return {Object} ret
 * @return {String} ret.input
 * @return {Commander} ret.program
 * @return {String} ret.filename
 * @return {Object} ret.options
 */

function parseOptions(argv) {
  program.usage('[options] <file>').version(packageJson.version).option('-t,--title <title>', 'The title for your post').option('-d,--description <desc>', 'A short description for your post').option('-p,--parent <parent>', 'The parent post for this post, defaults to steembin').option('-w,--watch', 'Start a live-reloading preview for this post').option('-n,--noopen', 'When used with watch, prevent opening the preview').option('-l,--link <link>', 'The post\'s permalink').option('-r,--raw', 'If not specified, steembin will try to generate a markdown wrapper for your content').option('-v,--verbose', 'Be verbose').option('--parent-author <parentAuthor>', 'The author of parent post for this post').option('--username <username>', 'Your Steem username').option('--password <password>', 'Your Steem password').option('--wif <wif>', 'A Steem \'posting\' WIF token').option('--theme <theme>', 'Which theme to use for your post').option('--tags <tags>', 'Comma separated list of tags').parse(argv || process.argv);

  let filename = program.args[0];
  if (!filename) {
    console.error('');
    console.error(chalk.red('  Error:') + ' Missing required parameter <file>');
    program.outputHelp();
    process.exit(1);
  }

  if (!program.wif && !program.username && process.env.STEEM_USERNAME) info(chalk.blue('Info:') + ` Using STEEM_USERNAME=${ process.env.STEEM_USERNAME }`);

  if (!program.wif && !program.password && process.env.STEEM_PASSWORD) info(chalk.blue('Info:') + ' Using STEEM_PASSWORD=********');

  const options = {
    wif: program.wif,
    username: program.username || process.env.STEEM_USERNAME,
    password: program.password || process.env.STEEM_PASSWORD,
    parent: program.parent,
    parentAuthor: program.parentAuthor,
    raw: program.raw,
    theme: program.theme,
    link: program.link,
    noopen: program.noopen,
    watch: program.watch,
    description: program.desc,
    title: program.title,
    tags: program.tags
  };

  let input;
  try {
    input = fs.readFileSync(filename).toString();
  } catch (err) {
    console.error(chalk.red('Error:') + ' Failed to read input file');
    console.error(err.message);
    process.exit(1);
  }

  const results = exports.getDefaults(options, filename, input);

  return {
    program,
    input: results.input,
    filename: results.filename,
    options: results.options
  };
}