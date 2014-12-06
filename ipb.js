var cheerio = require('cheerio');
var request = require('sync-request');

exports.page = function(url) {
  var content = request('GET', url).getBody().toString();

  var $ = cheerio.load(content);
  return {
    posts: function() {
      return $('.post_block').map(function() {
        return {
          author: $(this).find('.author_info [itemprop=name]').text(),
          body: $(this).find('[itemprop=commentText]').text(),
          postingDate: $(this).find('[itemprop=commentTime]').attr('title')
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
      return $('.topic_controls .pages li:last-child a').attr('href') || url;
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
