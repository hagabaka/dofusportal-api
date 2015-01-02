var cheerio = require('cheerio');
var get = require('./request-fallback-to-cached');

exports.page = function(url) {
  var content = get(url);

  var $ = cheerio.load(content);
  return {
    posts: function() {
      return $('.post_block').map(function() {
        var postingDate = $(this).find('[itemprop=commentTime]').attr('title');
        return {
          author: $(this).find('.author_info [itemprop=name]').text(),
          body: $(this).find('[itemprop=commentText]'),
          url: $('a[rel="bookmark"]').attr('href'),
          postingDate: postingDate,
          editingDate: function() {
            var dateString = $(this).find('.edit strong').text().replace(/^Edited by [^,]+, (.+)\.$/, '$1');
            var date = new Date(dateString);
            if(date.valueOf()) {
              return dateString;
            } else {
              return postingDate;
            }
          }
        }
      }).toArray();
    },
    previousPage: function() {
      return $('.topic_controls .prev a').attr('href');
    },
    nextPage: function() {
      return $('.topic_controls .next a').attr('href');
    },
    firstPage: function() {
      return $('.topic_controls .pages li:nth-child(2) a').attr('href') || url;
    },
    lastPage: function() {
      return $('.topic_controls .forward li.last a').attr('href') ||
             $('.topic_controls .pages li:last-child a').attr('href') || url;
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
  }
}
