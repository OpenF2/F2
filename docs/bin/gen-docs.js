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
locals.templates = {
  head: fs.readFileSync(path.resolve(__dirname, '../src/template/head.html'), 'utf8'),
  nav: fs.readFileSync(path.resolve(__dirname, '../src/template/nav.html'), 'utf8'),
  footer: fs.readFileSync(path.resolve(__dirname, '../src/template/footer.html'), 'utf8')
};

//loop over *.md files in source directory for conversion
srcFiles.forEach(function(filename) {
  var src, html, dist, _locals, headings = [];

  _locals = _.extend({},locals,pkg);

  //F2 docs are written only in markdown
  if (!filename.match(/\.md$/)) {
    return;
  }

  _locals.filename = filename;
  _locals.filename_html = filename.replace(/\.md$/, '.html');

  //override Marked heading renderer
  //https://github.com/chjj/marked#overriding-renderer-methods
  renderer.heading = function(text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    var html;

    //de-dupe headings so we end up with unique <hx> IDs in the HTML
    if (_.contains(headings,escapedText)){
      escapedText += '-' + _.indexOf(headings, escapedText);
    }

    //clean up URL slightly if hash looks like this: "#which-apps-support-a-locale-"
    //by removing trailing hypen
    var hasHyphenLast = escapedText.substr(escapedText.length - 1) === '-';
    if (hasHyphenLast){
      escapedText = escapedText.substr(0, escapedText.length-1);
    }

    html = (level > 1) ?
        '<h' + level + ' class="link-header" id="' + escapedText + '">' + 
          text + 
          '<a class="anchor" href="#' + escapedText + '">' +
            '<span>#</span>' + 
          '</a>' +
        '</h' + level + '>'
        : '';

    //page <title> and some other UI  helper versions
    if (level === 1) {
      _locals.title = text;
      _locals.title_for_url = encodeURIComponent(_locals.title);
      _locals.title_css = escapedText;
    }

    //keep track for de-duping header IDs
    headings.push(escapedText);

    return html;
  };

  //get source
  src = fs.readFileSync(path.join(srcDir, filename), 'utf8');

  //convert markdown to html and highlight source code
  html = marked(src, { renderer: renderer, smartypants: true, highlight: function (code, lang) {
    if (lang){
      return highlight.highlight(lang, code).value;
    } else {
      return highlight.highlightAuto(code).value;
    }
  }});

  //"content" is HTML (converted from markdown & variables compiled)
  _locals.content = (handlebars.compile(html))(_locals);

  //compile template partials
  //this happens once for all the source files 
  //(after the 1st file, all the {{handlebars}} templates are replaced)
  for (var t in _locals.templates){
    _locals.templates[t] = (handlebars.compile( _locals.templates[t]) )(_locals);
  }

  //so we can highlight the 'active' section in the UI
  _locals.activeNav = {
    getstarted: _locals.title == 'Getting Started with F2',
    container: _locals.title == 'Container Development',
    app: _locals.title == 'App Development',
    extend: _locals.title == 'Extending F2',
    f2js: _locals.title == 'F2.js SDK',
    about: _locals.title == 'About F2'
  };

  //now compile the templateFile to add _locals.templates and _locals.content
  dist = (handlebars.compile(template, {noEscape:true}))(_locals);

  //save to /dist
  fs.writeFileSync(path.join(distDir, filename.replace(/\.md$/, '.html')), dist, 'utf8');

});//end loop