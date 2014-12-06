#!/usr/bin/env node

'use strict';

var marked = require('marked');
var highlight = require('highlight.js');
var path = require('path');
var fs = require('fs');
var pkg = require('../../package.json');
var handlebars = require('handlebars');
var _ = require('underscore');

var srcDir = path.resolve(__dirname, '../src/'),
  distDir = path.resolve(__dirname, '../dist/'),
  srcFiles = fs.readdirSync(srcDir),
  templateFile = path.resolve(__dirname, '../src/template/layout.html'),
  template = fs.readFileSync(templateFile, 'utf8'),
  renderer = new marked.Renderer(),
  locals = {};

//setup partials
locals.template = {
  head: fs.readFileSync(path.resolve(__dirname, '../src/template/head.html'), 'utf8'),
  nav: fs.readFileSync(path.resolve(__dirname, '../src/template/nav.html'), 'utf8'),
  footer: fs.readFileSync(path.resolve(__dirname, '../src/template/footer.html'), 'utf8')
};

//loop over *.md files in source directory for conversion
srcFiles.forEach(function(filename) {
  var src, html, title, content, dist, index = [], _locals = {}, headings = [];

  //https://github.com/chjj/marked#overriding-renderer-methods
  renderer.heading = function(text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    var html;

    //de-dupe headings so we end up with unique <hx> IDs in the HTML
    if (_.contains(headings,escapedText)){
      escapedText += '-' + _.indexOf(headings, escapedText);
    }

    html = (level > 1) ?
        '<h' + level + ' class="link-header" id="' + escapedText + '">' + 
          '<a class="anchor" href="#' + escapedText + '">' +
            '<span class="fa fa-link"></span>' +
          '</a>' +
          text + 
        '</h' + level + '>'
        : '';

    if (level > 1 && level < 4) {
      index.push({ label: text, href: escapedText, level: 'h' + level });
    } else if (level === 1) {
      title = text;
    }

    headings.push(escapedText);

    return html;
  };

  //F2 docs are written only in markdown
  if (!filename.match(/\.md$/)) {
    return;
  }

  //make all locals siblings
  _locals = _.extend(_locals,pkg,locals);

  //get source
  src = fs.readFileSync(path.join(srcDir, filename), 'utf8');
  //convert markdown to html and highlight source code
  html = marked(src, { renderer: renderer, smartypants: true, highlight: function (code, lang) {
    return highlight.highlight(lang, code).value;
  }});

  //set locals
  if (title) {
    _locals.title = title;
    _locals.title_for_url = encodeURIComponent(title);
  }

  _locals.filename = filename;
  _locals.filename_html = filename.replace(/\.md$/, '.html');

  //"content" is HTML (converted from markdown & variables compiled)
  _locals.content = (handlebars.compile(html))(_locals);

  //compile template partials
  for (var t in _locals.template){
    _locals.template[t] = (handlebars.compile(_locals.template[t]))(_locals);
  }

  //so we can highlight the 'active' section in the UI
  _locals.activeNav = {
    getstarted: title == 'Get Started with F2',
    container: title == 'Container Development',
    app: title == 'App Development',
    extend: title == 'Extending F2',
    f2js: title == 'F2.js SDK',
    about: title == 'About F2'
  }

  //now compile entire template
  dist = (handlebars.compile(template, {noEscape:true}))(_locals);

  //save to /dist
  fs.writeFileSync(path.join(distDir, filename.replace(/\.md$/, '.html')), dist, 'utf8');

});//end loop
