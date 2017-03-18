var Timeline = require('../libs/timeline')
var should = require('chai').should()

describe('Formatting', function () {
  describe('#formatTweet()', function() {
    it('should remove double line breaks', function (done) {
      var testTweet = {
        text: "My tweet\n\nbreaks\n\nlines !"
      }

      testTweet = Timeline.formatTweet(testTweet);
      testTweet.text.should.equal("My tweet\nbreaks\nlines !");
      done();
    });

    it('should remove trailing tweeter url', function (done) {
      var testTweet = {
        text: "My tweet https://t.co/iHu2eg8h"
      }

      testTweet = Timeline.formatTweet(testTweet);
      testTweet.text.should.equal("My tweet ");
      done();
    });

    it('should decode HTML entities', function (done) {
      var testTweet = {
        text: "My &amp;&#212; &#174;"
      }

      testTweet = Timeline.formatTweet(testTweet);
      testTweet.text.should.equal("My &Ô ®");
      done();
    });
  });
});
