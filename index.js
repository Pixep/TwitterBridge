var Express = require('express')
var Twitter = require('twitter')
var Request = require('request')
var Entities = require('html-entities').XmlEntities
var app = Express()

var twitterAccount = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var params = {count: 30}
app.get('/:pass/tweets_old', function (req, res) {
  if (req.params.pass != "1645328")
  {
    res.end()
    return
  }

  twitterAccount.get('statuses/home_timeline', params, function(error, tweets, response) {
    if (error) {
      console.log('Tweeter timeline error ! %j', error)
      res.send('')
    } else {
      res.json(tweets)
    }
  })
})

app.get('/:pass/tweets', function (req, res) {
  if (req.params.pass != "1645328")
  {
    res.end()
    return
  }

  twitterAccount.get('statuses/home_timeline', params, function(error, tweets, response) {
    if (error) {
      console.log('Tweeter timeline error ! %j', error)
      res.send('')
    } else {
      var entities = new Entities();
      for(var i = 0; i < tweets.length; i++)
      {
        var tweet = tweets[i];
        if (tweet.entities && tweet.entities.urls[0])
        {
          var tweetUrl = tweet.entities.urls[0].url;
          tweet.text = tweet.text.replace(tweetUrl, '');
        }
        tweet.text = tweet.text.replace(/https:\/\/t\.co\/[a-z0-9]+$/gi, '');
        tweet.text = entities.decode(tweet.text);
        tweet.text = tweet.text.replace(/\n\n/g, '\n');
        tweets[i] = tweet;
      }
      res.json(tweets)
    }
  })
})

app.get('/tweetImage/*', function (req, res) {
  var proxyUrl = req.url;
  if (! (proxyUrl.endsWith('.png') || proxyUrl.endsWith('.jpg') || proxyUrl.endsWith('.jpeg') || proxyUrl.endsWith('.gif')))
  {
    console.log('Incorrect proxy url' + proxyUrl)
    res.end()
  }

  console.log('Proxying: ' + proxyUrl)
  proxyUrl = proxyUrl.replace('/tweetImage/', 'http://')
  console.log('To: ' + proxyUrl)
  Request.get(proxyUrl).pipe(res)
})

app.listen(8585, function () {
  console.log('Twitter proxy running on 8585 !')
})
