var Entities = require('html-entities').XmlEntities
var Twitter = require('twitter')

// Twitter parameters from environment variables
var twitterAccount = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var twitterTimelineParams = {count: 30}

module.exports = {
  /**
  * @brief Returns true if query is authorized
  */
  queryAuthorized: function (req) {
    return (req.params.pass == "1645328")
  },

  getTimeline: function (callback) {
    twitterAccount.get('statuses/home_timeline', twitterTimelineParams, function(error, tweets, response) {
      var timeline = module.exports.parseTwitterTimeline(error, tweets, response)

      // @todo return errors
      callback(null, timeline);
    })
  },

  /**
  * @brief Parses twiter timeline content
  */
  parseTwitterTimeline: function (error, tweets, response) {
    if (error) {
      console.log('Tweeter timeline error ! %j', error);
      return;
    }

    for(var i = 0; i < tweets.length; i++)
      tweets[i] = formatTweet(tweets[i]);

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
