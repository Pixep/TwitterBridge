var Express = require('express');
var bodyParser = require('body-parser');
var qr = require('qr-image');
var MediaProxy = require('./libs/media-proxy');
var Timeline = require('./libs/timeline');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var app = Express();
var port = 8585;

var url = 'mongodb://localhost:27017/witekio-coffee';
var db = null;
var usersCollection = null;
MongoClient.connect(url, function(err, database) {
  if (err) {
    console.log(err);
  }
  else {
    db = database;
    usersCollection = db.collection('customers');
  }
});

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

/**
 * @brief Save user infos
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
var currentUser = {};
currentUser.name = "";

app.post('/api/updateUser', function (req, res) {
  if (!req.body.id) {
    console.log("updateUser: user id not set!");
    res.sendStatus(400);
    return;
  }

  currentUser.id = req.body.id;
  currentUser.name = req.body.name;
  currentUser.email = req.body.email;

  console.log("Ok?");
  usersCollection.update({id:currentUser.id}, {$set: {id: currentUser.id, name: currentUser.name, email: currentUser.email}}, {upsert: true});
  console.log(currentUser.id);
  res.sendStatus(200);
})

app.post('/api/addBeverageToUser', function (req, res) {
  if (!currentUser.id) {
    console.log("addBeverageToUser: currentUser not set!");
    res.sendStatus(400);
    return;
  }

  var beverageId = req.body.beverageId;
  var beverageName = req.body.beverageName;
  var timestamp = Date.now();

  usersCollection.update({id:currentUser.id}, {$push:{beverages:{id: beverageId, name: beverageName, date: timestamp}}}, {upsert: true});
  console.log("add ok ? " + currentUser.id);
  res.sendStatus(200);
})

app.get('/api/users', function (req, res) {
  var results = usersCollection.find({});
  results.toArray(function(err, docs) {
    res.json(docs);	
  });
});

/**
 * @brief Get user infos
 */
app.get('/api/currentUser', function (req, res) {
  res.json(currentUser);
})

/**
 * @brief Get user infos
 */
app.post('/api/userInfo', function (req, res) {
  var userId = req.body.id
  if (!userId)
    res.close();

  var beverages = usersCollection.find({id: userId}, {beverages:1, _id:0});
  beverages.toArray(function(err, docs) {
    if (docs.length === 0)
      res.sendStatus(200);

    var beverages = docs[0].beverages;
    var result = {
      count: beverages ? beverages.length : 0,
      latest: docs ? beverages[beverages.length-1].name : ""
    };
    res.json(result);
  });
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
