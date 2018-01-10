var request = require("request");
var cheerio = require("cheerio");
var format = require("string-template");
var fs = require('fs');

var url = 'https://www.crowdsupply.com/sutajio-kosagi/tomu';
var social_text = 'Support Tomu on Crowd Supply! A computer for your USB port!';

request({
    uri: url,
}, function(error, response, body) {
    var $ = cheerio.load(body);

    var data = {};
    $('.fact', 'div.project-block:nth-of-type(1) > .factoids').each(function() {
        var category = $(this).find('span').text();
        var value = $(this).find('p').html();
        data[category] = value;
    });

    data.pledged = $('span', '.project-pledged').first().text();
    data.goal = $('span', '.project-goal').first().text();
    data.time = new Date();
    data.project_block = $('.project-block').first().html();
    console.log(JSON.stringify(data));

    var html_template = `<html>
    <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" type="text/css" href="style.css">
    </head>
    <body>
    <div class='container'>
    <div class='crowdsupply-box'>
    
    <div class='image'>
     <a href="https://www.crowdsupply.com/sutajio-kosagi/tomu/" target="_top">
       <img src="https://www.crowdsupply.com/img/3eef/tomu-size-scale_jpg_project-tile-pad.jpg">
     </a>
    </div>
    <div class="message">
     <a href="https://tomu.im" target="_top">Tomu</a>, a computer for your USB port<br>
     <a href="https://www.crowdsupply.com/sutajio-kosagi/tomu/" target="_top">
     Support this project now on
       <img src="https://www.crowdsupply.com/_teal/images/crowd-supply-logo-light@2x.png" style="padding: 2px; height: 2em; vertical-align: middle;">
     </a>
    </div>
    
    <div class="project-block">
    {project_block}
    </div>
    
    <div class='end'></div>
    </div>
    </div>
    </body>`;
    console.log(format('{pledges} pledges - {pledged} of {goal} ({funded}) - Preorder available!', data));
    html_page = format(html_template, data);

    // Patch the HTML to properly format the box, because Crowd Supply CSS uses inheritence and it won't work otherwise.
    html_page = html_page.replace('<p class="project-pledged">','<div class="project-funds"><p class="project-pledged">')
    html_page = html_page.replace('<div class="factoids">', '</div><div class="factoids">')

    // Patch social media buttons
    html_page = html_page.replace('text=Check+out+this+Crowd+Supply+project', 'text=' + encodeURIComponent(social_text));
    html_page = html_page.replace('description=Check+out+this+Crowd+Supply+project', 'description=' + encodeURIComponent(social_text));

    console.log(html_page);
    
    // Save the primary html file
    fs.writeFile('badge.html', html_page, (err) => {
        if (err) {
            console.log('Unable to save file');
            return console.log(err);
        }
        console.log('Saved badge.html');
    });

    // Save a copy for the image rendering
    image_page = html_page.replace('</body>', '<link rel="stylesheet" type="text/css" href="image.css"></body>');
    fs.writeFile('image.html', image_page, (err) => {
        if (err) {
            console.log('Unable to save image page');
            return console.log(err);
        }

    });
});