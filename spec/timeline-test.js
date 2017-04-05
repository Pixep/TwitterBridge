var Timeline = null;
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');

var currentTestSet = 0;
var testData = [
  {
    tweets: [
      { text: "tweet#1 user 1", user: { id_str: "1" } },
      { text: "tweet#2 user 2", user: { id_str: "2" } },
      { text: "tweet#3 user 3", user: { id_str: "3" } },
      { text: "tweet#4 user 4", user: { id_str: "4" } }]
  },
  {
    tweets: [
      { text: "tweet#1 user 1", user: { id_str: "1" }, retweeted_status: { text: "Original text"}  },
      { text: "tweet#2 user 2", user: { id_str: "2" } },
      { text: "tweet#3 user 2", user: { id_str: "2" } },
      { text: "tweet#4 user 3",  user: { id_str: "3"  } },
      { text: "tweet#5 user 3",  user: { id_str: "3"  } },
      { text: "tweet#6 user 3",  user: { id_str: "3"  } }]
  },
  {
    tweets: [
      { text: "tweet#1 user 1", user: { id_str: "1" } },
      { text: "tweet#2 user 2", user: { id_str: "2" }, retweeted_status: { text: "Original text"} },
      { text: "tweet#3 user 3", user: { id_str: "3" }, quoted_status: { text: "Original text"} },
      { text: "tweet#4 user 4", user: { id_str: "4" }, quoted_status: { text: "Original text"} },
      { text: "tweet#5 user 5", user: { id_str: "5" } }]
  },
  {
    tweets: [
      { text: "tweet#1 user 1", user: { id_str: "1" } },
      { text: "tweet#2 user 2", user: { id_str: "2" }, retweeted_status: { text: "Original text"} },
      { text: "tweet#3 user 3", user: { id_str: "3" }, quoted_status: { text: "Original text"} },
      { text: "tweet#4 user 4", user: { id_str: "4" }, quoted_status: { text: "Original text"} },
      { text: "tweet#5 user 5", user: { id_str: "5" } }]
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
    var stub = null;

    afterEach(function() {
      if (stub)
        stub.restore();
    });

    it('should return an error if authentication fails', function (done) {
      stub = sinon.stub(Timeline.twitter, "get").callsFake(function(path, params, callback) {
        callback(new Error("Error"), null, null);
      });

      var params = {}
      Timeline.getTimeline(params, function(error, tweets) {
        expect(error).to.exist;
        expect(tweets).to.be.null;
        done();
      });
    });

    it('should return tweets when no error occurs', function (done) {
      stub = sinon.stub(Timeline.twitter, "get").callsFake(function(path, params, callback) {
        callback(null, testData[0].tweets, null);
      });

      var params = {}
      Timeline.getTimeline(params, function(error, tweets, response) {
        expect(error).to.be.null;
        expect(tweets).to.exist;
        expect(tweets).to.have.lengthOf(4);
        done();
      });
    });

    it('should keep only N tweet per author/user', function (done) {
      stub = sinon.stub(Timeline.twitter, "get").callsFake(function(path, params, callback) {
        callback(null, testData[1].tweets, null);
      });

      var params = {
        maxTweetsPerUser: 2,
        removeRetweets: false,
        removeQuotedTweets: false,
        maxTweets: 20,
        shuffleTweets: false
      }
      Timeline.getTimeline(params, function(error, tweets) {
        expect(error).to.be.null;
        expect(tweets).to.exist;
        expect(tweets).to.have.lengthOf(5);
        done();
      });
    });

    it('should remove retweets', function (done) {
      stub = sinon.stub(Timeline.twitter, "get").callsFake(function(path, params, callback) {
        callback(null, testData[2].tweets, null);
      });

      var params = {
        maxTweetsPerUser: 2,
        removeRetweets: true,
        removeQuotedTweets: false,
        maxTweets: 20
      }
      Timeline.getTimeline(params, function(error, tweets) {
        expect(error).to.be.null;
        expect(tweets).to.exist;
        expect(tweets).to.have.lengthOf(4);
        done();
      });
    });

    it('should remove quoted tweets', function (done) {
      stub = sinon.stub(Timeline.twitter, "get").callsFake(function(path, params, callback) {
        callback(null, testData[3].tweets, null);
      });

      var params = {
        maxTweetsPerUser: 2,
        removeRetweets: false,
        removeQuotedTweets: true,
        maxTweets: 20
      }
      Timeline.getTimeline(params, function(error, tweets) {
        expect(error).to.be.null;
        expect(tweets).to.exist;
        expect(tweets).to.have.lengthOf(3);
        done();
      });
    });

    it('should not return more than the maximum tweets setting', function (done) {
      stub = sinon.stub(Timeline.twitter, "get").callsFake(function(path, params, callback) {
        callback(null, testData[0].tweets, null);
      });

      var params = {
        maxTweetsPerUser: 2,
        removeRetweets: true,
        maxTweets: 2,
        shuffleTweets: true
      }
      Timeline.getTimeline(params, function(error, tweets) {
        expect(error).to.be.null;
        expect(tweets).to.exist;
        expect(tweets).to.have.lengthOf(2);
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

      Timeline.formatTweet(testTweet);
      testTweet.text.should.equal("My tweet\nbreaks\nlines !");
      done();
    });

    it('should remove trailing tweeter url', function (done) {
      var testTweet = {
        text: "My tweet https://t.co/iHu2eg8h"
      }

      Timeline.formatTweet(testTweet);
      testTweet.text.should.equal("My tweet ");
      done();
    });

    it('should decode HTML entities', function (done) {
      var testTweet = {
        text: "My &amp;&#212; &#174;"
      }

      Timeline.formatTweet(testTweet);
      testTweet.text.should.equal("My &Ô ®");
      done();
    });
  });
});
