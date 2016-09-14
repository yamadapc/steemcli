# steemcli
A command-line client for posting content to Steem

![](http://i.imgur.com/g8tt2cN.gif)

## Install
```
npm install -g steemcli
```

## Usage
```

  Usage: steemcli [options] <file>

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -t,--title <title>              The title for your post
    -d,--description <desc>         A short description for your post
    -p,--parent <parent>            The parent post for this post, defaults to steembin
    -w,--watch                      Start a live-reloading preview for this post
    -n,--noopen                     When used with watch, prevent opening the preview
    -l,--link <link>                The post's permalink
    -r,--raw                        If not specified, steembin will try to generate a markdown wrapper for your content
    -v,--verbose                    Be verbose
    --parent-author <parentAuthor>  The author of parent post for this post
    --username <username>           Your Steem username
    --password <password>           Your Steem password
    --wif <wif>                     A Steem 'posting' WIF token
    --theme <theme>                 Which theme to use for your post
    --tags <tags>                   Comma separated list of tags

```

## Editor Integration
- Basic Emacs integration is available through the `steemcli.el` Emacs Lisp file


## License
Published under the GPLv3 license by Pedro Tacla Yamada (@yamadapc)
