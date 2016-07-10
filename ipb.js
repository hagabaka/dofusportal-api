var cheerio = require('cheerio');
var get = require('./request');

exports.page = function(url) {
  return get(url).then(function(content) {
    var $ = cheerio.load(content);
    return {
      posts: function() {
        return $('article.cPost').map(function() {
          var postingDate = $(this).find('a > time').attr('datetime');
          return {
            author: $(this).find('.cAuthorPane_author [itemprop=name] a').text(),
            body: $(this).find('[itemprop=text]'),
            url: $('a[data-roll="shareComment"]').attr('href'),
            postingDate: postingDate,
            editingDate: function() {
              var dateString = $(this).find('strong > time').attr('datetime');
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
        return $('.ipsPagination_prev a').attr('href');
      },
      nextPage: function() {
        return $('.ipsPagination_next a').attr('href');
      },
      firstPage: function() {
        return $('.ipsPagination_first a').attr('href') || url;
      },
      lastPage: function() {
        return $('.ipsPagination_last a').attr('href') ||
          $('.ipsPagination li:last-child a').attr('href') || url;
      },
      replyUrl: function() {
        var upUrl = $('link[rel=up]').attr('href');
        if(upUrl) {
          var forumNumber = upUrl.match(/forum\/(\d+)/)[1];
          var postNumber = url.match(/topic\/(\d+)/)[1];
          var baseUrl = url.match(/(.+)\/topic\/.+/)[1];
          return baseUrl + '/index.php?app=forums&module=post&section=post&do=reply_post&f=' + forumNumber + '&t=' + postNumber;
        }
      }
    };
  });
};
