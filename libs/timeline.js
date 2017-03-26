var Entities = require('html-entities').XmlEntities
var Twitter = require('twitter')
var MediaProxy = require('./media-proxy');

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

function _includeVideoAsGif(tweet) {
  if (tweet.extended_entities && tweet.extended_entities.media) {
    for (var i = 0; i < tweet.extended_entities.media.length; ++i) {
      if (tweet.extended_entities.media[i].video_info &&
          tweet.extended_entities.media[i].video_info.variants) {
        // Add an 'animatedGif' field
        var mediaUrl = tweet.extended_entities.media[i].video_info.variants[0].url;
        if (mediaUrl && mediaUrl.endsWith('.mp4')) {
          tweet.animated_gif_url = process.env.LOCAL_MEDIA_URL + MediaProxy.mediaCache.videoAsGif(mediaUrl);
          break;
        }
      }
    }
  }
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

    var twitterTimelineParams = {count: 50}
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
    var tweeterAccounts = new Array();
    var i = 0;

    // Keep only 1 message per user
    while (i < tweets.length) {
      if (tweets[i].user == null || tweeterAccounts.includes(tweets[i].user.id_str)) {
        tweets.splice(i, 1);
        continue;
      }

      tweets[i] = module.exports.formatTweet(tweets[i]);
      tweeterAccounts.push(tweets[i].user.id_str);
      ++i;
    }

    // Convert video to GIF and include video Url
    for (var i = 0; i < tweets.length; ++i)
      _includeVideoAsGif(tweets[i]);

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
