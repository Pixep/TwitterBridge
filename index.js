// Dependencies
var fs = require('fs');
var path = require('path');

// Express
var express = require('express');
var app = express();
var port = 3601;

// Internal modules
var mediaProxy = require('./libs/media-proxy');
var timeline = require('./libs/timeline');
var controllers = require('./controllers');
controllers.setup(app);

/**
* @brief Returns true if query is authorized
*/
function queryAuthorized (req) {
  return true;
}

/**
 * @brief Twitter timeline
 * @return Twitter timeline content in JSON
 */
app.get('/api/tweets', function (req, res) {
  if ( !queryAuthorized(req))
  {
    res.end();
    return;
  }

  var params = {
    maxTweetsPerUser: 2,
    removeRetweets: false,
    removeQuotedTweets: false,
    maxTweets: 20,
    shuffleTweets: true,
    cachedVideosUrl: "http://witekio-coffee.com/api/video"
  }
  timeline.getTimeline(params, function(error, timeline) {
    if (timeline == undefined) {
      res.send('');
    }

    // Censored ! :)
    for (var i = 0; i < timeline.length; i++) {
      timeline[i].user.name = timeline[i].user.name.replace("Internet of Shit", "Internet of Stuff");
    }

    res.json(timeline);
  });
})

/**
 * @brief Twitter image proxy
 * @return Twitter target image through nodeJS
 */
app.get('/api/tweetImage/*', function (req, res) {
   mediaProxy.serveImage(req, res, "/api/tweetImage/");
})

timeline.assertEnvironmentSet();

if ( ! process.env.SERVER_NAME.endsWith('/'))
  process.env.SERVER_NAME = process.env.SERVER_NAME + '/';

// Serve videos as Gif
app.use('/api/video', express.static(mediaProxy.mediaCache.path));

// Run the server
app.listen(port, 'localhost', function () {
    console.log('Twitter proxy running on ' + port + ' !')
})

process.on('uncaughtException', function(err) {
    if(err.errno === 'EADDRINUSE')
         console.log("Address or port is already in use by another proccess: " + err);
    else
         console.log(err);
    process.exit(1);
});
