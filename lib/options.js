const program = require('commander');
const chalk = require('chalk');
const path = require('path');

/**
 * Parses command-line options
 *
 * @return {Object} ret
 * @return {String} ret.input
 * @return {Commander} ret.program
 * @return {String} ret.filename
 * @return {Object} ret.options
 */

exports = module.exports = function parseOptions(argv) {
  program
    .usage('[options] <file>')
    .option('-t,--title <title>', 'The title for your post')
    .option('-d,--description <desc>', 'A short description for your post')
    .option('-p,--parent <parent>', 'The parent post for this post, defaults to steembin')
    .option('-w,--watch', 'Start a live-reloading preview for this post')
    .option('-n,--noopen', 'When used with watch, prevent opening the preview')
    .option('-l,--link <link>', 'The post\'s permalink')
    .option('-r,--raw', 'If not specified, steembin will try to generate a markdown wrapper for your content')
    .option('-v,--verbose', 'Be verbose')
    .option('--username <username>', 'Your Steem username')
    .option('--password <password>', 'Your Steem password')
    .option('--wif <wif>', 'A Steem \'posting\' WIF token')
    .option('--theme <theme>', 'Which theme to use for your post')
    .option('--tags <tags>', 'Comma separated list of tags')
    .parse(argv || process.argv);

  const filename = program.args[0];
  if (!filename) {
    console.error('');
    console.error(chalk.red('  Error:') + ' Missing required parameter <file>');
    program.outputHelp();
    process.exit(1);
  }

  if (!program.wif && !program.username &&
      process.env.STEEM_USERNAME)
    info(chalk.blue('Info:') + ` Using STEEM_USERNAME=${process.env.STEEM_USERNAME}`);

  if (!program.wif && !program.password &&
      process.env.STEEM_PASSWORD)
    info(chalk.blue('Info:') + ' Using STEEM_PASSWORD=********');

  const options = {
    wif: program.wif,
    username: program.username || process.env.STEEM_USERNAME,
    password: program.password || process.env.STEEM_PASSWORD,
    parent: program.parent,
    raw: program.raw,
    theme: program.theme,
    link: program.link,
    noopen: program.noopen,
    watch: program.watch,
    description: program.desc,
    title: program.title,
    tags: program.tags,
  };

  let input;
  try {
    input = fs.readFileSync(filename).toString();
  } catch (err) {
    console.error(chalk.red('Error:') + ' Failed to read input file');
    console.error(err.message);
    process.exit(1);
  }

  const results = getDefaults(options, filename, input);

  return {
    program,
    input: results.input,
    filename: results.filename,
    options: results.options,
  };
};

/**
 * Post-processes options to get defaults
 */

exports.getDefaults = function getDefaults(options, filename, input) {
  function getDefaultAuth(options) {
    if (options.wif) return;
    info(chalk.blue('Info:') + ' Generating WIF token for posting');
    options.wif = steem.auth.toWif(
      options.username,
      options.password,
      'posting'
    );
  }

  function getDefaultParent(options) {
    if (!options.parent) {
      info(chalk.blue('Info:') + ' Using steembin as the parent');
      options.parent = 'steembin';
    }
  }

  function getDefaultTitle(options) {
    if (!options.title) {
      info(chalk.blue('Info:') + ' Using ' + filename + ' as the title');
      options.title = filename;
    }
  }

  function getDefaultLink(options) {
    if (!options.link) {
      info(chalk.blue('Info:') + ' Using ' + options.link + ' as the permalink');
      options.link = slug(options.title).toLowerCase();
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
  };
  const fencedBlocksData = _.map(fencedBlocks, (value, key) => {
    return {extensions: value, fence: key};
  });

  function postProcessInput() {
    const extname = path.extname(filename);
    if (['.markdown', '.md', '.txt', '.markd', '']
        .indexOf(extname) === -1 && !options.raw) {
      const bt = _.find(fencedBlocksData, ({extensions}) => {
        return extensions.indexOf(extname.slice(1)) !== -1;
      });
      if (bt) {
        warn(chalk.yellow('Warning:') + ' Wrapping content in ```' + chalk.blue(bt.fence) +
             ' block, use --raw to bypass');
        let preinput = '';
        if (options.desc)
          preinput = options.desc + '\n\n';
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

  return {options, filename, input};
};
