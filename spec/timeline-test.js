var Timeline = null;
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');

var currentTestSet = 0;
var testData = [
  {
    expectedCount: 4,
    tweets: [
      { text: "tweet#1 user 5",  user: { id_str: "5" } },
      { text: "tweet#2 user 7",  user: { id_str: "7" } },
      { text: "tweet#3 user 10", user: { id_str: "10" } },
      { text: "tweet#4 user 13", user: { id_str: "13"  } }]
  },
  {
    expectedCount: 3,
    tweets: [
      { text: "tweet#1 user 12", user: { id_str: "12" } },
      { text: "tweet#2 user 18", user: { id_str: "18" } },
      { text: "tweet#3 user 18", user: { id_str: "18" } },
      { text: "tweet#4 user 5",  user: { id_str: "5"  } },
      { text: "tweet#5 user 5",  user: { id_str: "5"  } },
      { text: "tweet#6 user 5",  user: { id_str: "5"  } }]
  }
];

describe('Timeline module', function () {
  it('should throw when required, if environment is not set properly', function (done) {
    expect(function() { require('../libs/timeline') }).to.throw(Error);
    done();
  })

  it('should not throw when required, if environment is set properly', function (done) {
    process.env.TWITTER_CONSUMER_KEY = "key";
    process.env.TWITTER_CONSUMER_SECRET = "secret";
    process.env.TWITTER_ACCESS_TOKEN_KEY = "key";
    process.env.TWITTER_ACCESS_TOKEN_SECRET = "secret";

    expect(function() { Timeline = require('../libs/timeline'); }).to.not.throw(Error);
    done();
  })
})

describe('Retrieve tweets timeline', function () {
  describe('#getTimeline()', function() {
    it('should return an error if authentication fails', function (done) {
      Timeline.getTimeline(function(error, tweets) {
        expect(error).to.exist;
        expect(tweets).to.be.null;
        done();
      });
    });

    it('should return tweets when no error occurs', function (done) {
      currentTestSet = 0;
      var stub = sinon.stub(Timeline.twitter, "get").callsFake(function(path, params, callback) {
        callback(null, testData[currentTestSet].tweets, null);
      });

      Timeline.getTimeline(function(error, tweets, response) {
        expect(error).to.be.null;
        expect(tweets).to.exist;
        expect(tweets).to.have.lengthOf(testData[currentTestSet].expectedCount);
        done();
      });
    });

    it('should keep only one tweet per author/user', function (done) {
      currentTestSet = 1;

      Timeline.getTimeline(function(error, tweets) {
        expect(error).to.be.null;
        expect(tweets).to.exist;
        expect(tweets).to.have.lengthOf(testData[currentTestSet].expectedCount);
        done();
      });
    });
  });
});

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