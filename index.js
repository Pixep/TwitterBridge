var Express = require('express');
var MediaProxy = require('./libs/media-proxy');
var Timeline = require('./libs/timeline');

var app = Express();
var port = 8585;

/**
* @brief Returns true if query is authorized
*/
function queryAuthorized (req) {
  return (req.params.pass == "1645328")
}

/**
 * @brief Twitter timeline
 * @return Twitter timeline content in JSON
 */
app.get('/:pass/tweets', function (req, res) {
  if ( !queryAuthorized(req))
  {
    res.end();
    return;
  }

  Timeline.getTimeline(function(error, timeline) {
    if (timeline == undefined) {
      res.send('');
    }

    res.json(timeline);
  });
})

/**
 * @brief Twitter image proxy
 * @return Twitter target image through nodeJS
 */
app.get('/tweetImage/*', function (req, res) {
   MediaProxy.serveImage(req, res);
})

Timeline.assertEnvironmentSet();
MediaProxy.mediaCache.videoAsGif('https://video.twimg.com/tweet_video/C7jrQUoW0AA2P5H.mp4');

// Run the server
app.listen(port, function () {
    console.log('Twitter proxy running on ' + port + ' !')
})
