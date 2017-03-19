var Entities = require('html-entities').XmlEntities
var Twitter = require('twitter')

/**
* @brief Update account information from environment
*/
function _twitterFromEnvironment () {
  _assertEnvironmentSet()
  return new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  });
}

/**
* @brief Make sure the appropriate environment variables are set, or throw
*/
function _assertEnvironmentSet () {
  if ( process.env.TWITTER_CONSUMER_KEY == undefined          || process.env.TWITTER_CONSUMER_KEY == null
    || process.env.TWITTER_CONSUMER_SECRET == undefined       || process.env.TWITTER_CONSUMER_SECRET == null
    || process.env.TWITTER_ACCESS_TOKEN_KEY == undefined      || process.env.TWITTER_ACCESS_TOKEN_KEY == null
    || process.env.TWITTER_ACCESS_TOKEN_SECRET == undefined   || process.env.TWITTER_ACCESS_TOKEN_SECRET == null)
    throw new Error("One or more of the following environment variables is not set: " +
          "TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET " +
          "TWITTER_ACCESS_TOKEN_KEY, TWITTER_ACCESS_TOKEN_SECRET");
}

module.exports = {
  twitter: _twitterFromEnvironment(),
  assertEnvironmentSet: _assertEnvironmentSet,
  twitterFromEnvironment: _twitterFromEnvironment,

  /**
  * @brief Returns tweeter timeline
  * @param callback(error, tweets, response)
  */
  getTimeline: function (callback) {
    module.exports.assertEnvironmentSet();

    var twitterTimelineParams = {count: 30}
    module.exports.twitter.get('statuses/home_timeline', twitterTimelineParams, function(error, tweets, response) {
      if (error)
        callback(error, null);

      var timeline = module.exports.parseTwitterTimeline(tweets);
      callback(null, timeline);
    })
  },

  /**
  * @brief Parses twiter timeline content
  */
  parseTwitterTimeline: function (tweets) {
    for(var i = 0; i < tweets.length; i++)
      tweets[i] = module.exports.formatTweet(tweets[i]);

    return tweets;
  },

  /**
  * brief Format tweet by decoding it and removing tweet url
  */
  formatTweet: function (tweet) {
    // Identify and remove tweets urls
    if (tweet.entities && tweet.entities.urls[0])
    {
      var tweetUrl = tweet.entities.urls[0].url;
      tweet.text = tweet.text.replace(tweetUrl, '');
    }
    tweet.text = tweet.text.replace(/https:\/\/t\.co\/[a-z0-9]+$/gi, '');

    // Remove double line break
    tweet.text = tweet.text.replace(/\n\n/g, '\n');

    // Decode HTML entities
    var entities = new Entities();
    tweet.text = entities.decode(tweet.text);

    return tweet;
  }
}
