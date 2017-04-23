var Express = require('express');
var qr = require('qr-image');
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

  var params = {
    maxTweetsPerUser: 2,
    removeRetweets: false,
    removeQuotedTweets: false,
    maxTweets: 20,
    shuffleTweets: true
  }
  Timeline.getTimeline(params, function(error, timeline) {
    if (timeline == undefined) {
      res.send('');
    }

    // Copy media of retweets/quotes to the tweet itself
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
app.get('/tweetImage/*', function (req, res) {
   MediaProxy.serveImage(req, res);
})

/**
 * @brief Returns the latest QR-code to use in the application
 */
app.get('/qrcode', function (req, res) {
  var qrcode = qr.image('http://livemetronome.com/user-settings.html', { type: 'png' });
  qrcode.pipe(res);
})

Timeline.assertEnvironmentSet();

if ( ! process.env.SERVER_NAME.endsWith('/'))
  process.env.SERVER_NAME = process.env.SERVER_NAME + '/';

var localMediaPath = 'video';
process.env.LOCAL_MEDIA_URL = 'http://' + process.env.SERVER_NAME + localMediaPath + '/';

// Serve videos as Gif
app.use('/'+localMediaPath, Express.static(MediaProxy.mediaCache.path));

// Public folder
app.use(Express.static('public'));

// Run the server
app.listen(port, function () {
    console.log('Twitter proxy running on ' + port + ' !')
})
