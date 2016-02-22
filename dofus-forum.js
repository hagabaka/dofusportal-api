var cheerio = require('cheerio');
var get = require('./request');

exports.page = function(url) {
  var content = get(url);

  var $ = cheerio.load(content);
  return {
    posts: function() {
      return $('.aktable.aucun tr').map(function() {
        var postingDate = $(this).find('.postblockdate').text();
        if(postingDate) {
          if(postingDate.indexOf('|') > 0) {
            postingDate = postingDate.split('|')[0];
          }
          if(postingDate.match(/Today/i)) {
            postingDate = postingDate.replace(/Today/i, new Date().toDateString());
          }
          postingDate = new Date(postingDate.replace(/[^a-zA-Z0-9\s,:]/, '').trim());
        }
        return {
          author: $(this).find('.picto_user + a').text().trim(),
          body: $(this).find('.postcolor'),
          url: $('a[title="Display the link to this post"]').attr('href'),
          postingDate: postingDate,
          editingDate: function() {
            var dateString = $(this).find('.edit').text().trim().replace(/^This post has been edited by [^\-]+- (.+)\.$/, '$1');
            var date = new Date(dateString);
            if(date.valueOf()) {
              return dateString;
            }
            return postingDate;
          }
        };
      }).toArray();
    },
    previousPage: function() {
      return $('.pagelink[title*="Previous"]').attr('href');
    },
    nextPage: function() {
      return $('.pagelink[title*="Next"]').attr('href');
    },
    firstPage: function() {
      var firstPage = url;
      if(firstPage.match(/page=\d+$/)) {
        firstPage = firstPage.replace(/(\d+)$ /, 1);
      } else {
        if(!firstPage.match(/\?/)) {
          firstPage += '?';
        } else {
          firstPage += '&';
        }
        firstPage += 'page=1';
      }
      return $('.topic_controls .pages li:nth-child(2) a').attr('href') || url;
    },
    lastPage: function() {
      return $('.pagelinklast').attr('href') ||
             $('.pagelink:nth-last-child(3)').attr('href') ||
             url;
    },
    replyUrl: function() {
      return url.replace(/\/\d+-[^\/]+(\/\d+)-([^\/]+)$/, "$1-reply-$2");
    }
  };
};
