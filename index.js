var Express = require('express');
var ImageProxy = require('./libs/image-proxy');
var Timeline = require('./libs/timeline');

var app = Express();
var port = 8585;

/**
 * @brief Twitter timeline
 * @return Twitter timeline content in JSON
 */
app.get('/:pass/tweets', function (req, res) {
    if ( ! Timeline.queryAuthorized(req))
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
   ImageProxy.proxyImage(req, res);
})

// Run the server
app.listen(port, function () {
    console.log('Twitter proxy running on ' + port + ' !')
})
