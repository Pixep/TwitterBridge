var request = require('request');
var gify = require('gify');
const fs = require('fs');

function filenameToGif (filename) {
  return filename.replace('.mp4', '.gif');
}

class CachedVideo {
  constructor(path, filename) {
    this.path = path;
    this.filename = filename;
    this.refreshLastUsage();
  }

  deleteFile() {
    var videoToDelete = this.filepath();
    fs.unlink(videoToDelete, function(err) {
      if (err)
        console.log(err);
      else
        console.log('Deleted video ' + videoToDelete)
    })
  }

  refreshLastUsage() {
    this.lastUsageDate = Date.now();
  }

  filepath() {
    return this.path + this.filename;
  }
}

class MediaCache {
  constructor(cachePath) {
    this.index = 0;
    this.path = cachePath;
    this.videos = [];

    // Create videos directory
    if (!fs.existsSync(this.path)){
        fs.mkdirSync(this.path);
    }

    // Remove all
    var files = fs.readdirSync(this.path);
    for (const file of files) {
      var video = new CachedVideo(this.path, file);
      video.deleteFile();
    }
  }

  contains(filename) {
    return (this._cachedVideo(filename) !== null);
  }

  video(filename) {
    var video = this._cachedVideo(filename);
    if (video)
      return video.filepath();

    return '';
  }

  _cachedVideo(filename) {
    for (var i = 0; i < this.videos.length; i++) {
      if (this.videos[i].filename == filename)
        return this.videos[i];
    }

    return null;
  }

  _deleteCachedVideo(cachedVideo) {
    var index = this.videos.indexOf(cachedVideo);

    cachedVideo.deleteFile();

    if (index >= 0)
      this.videos.splice(index, 1);
  }

  videoAsGif(url) {
    if (!url.endsWith('.mp4'))
      return '';

    this.deleteUnusedVideos();

    var filename = url.replace(/^.*[\\\/]/, '');
    var filenameGif = filenameToGif(filename);

    if (!this.contains(filenameGif)) {
      this.cacheVideoAsGif(url, filename)
    }
    else {
      this._cachedVideo(filenameGif).refreshLastUsage();
    }

    return filenameGif;
  }

  deleteUnusedVideos() {
    var now = Date.now();
    var maxInactiveTime = 60 * (60 * 1000); // 60mins
    for (var i = 0; i < this.videos.length; i++) {
      if ((this.videos[i].lastUsageDate - now) >= maxInactiveTime)
        _deleteCachedVideo(this.videos[i]);
    }
  }

  cacheVideoAsGif(url, filename) {
    if (!url.endsWith('.mp4'))
      return false;

    // Create stream
    var filepathMP4 = this.path + filename;
    var filenameGIF = filenameToGif(filename);
    var filepathGIF = this.path + filenameGIF;
    var videoStream = fs.createWriteStream(filepathMP4);
    videoStream.on('close', function() {
      console.log('Downloaded ' + filename);

      gify(filepathMP4, filepathGIF, function(error) {
        if (error)
          console.error(error);

        fs.unlink(filepathMP4, function(error) {
          if (error)
            console.error(error);
        });
      });
    });

    // Register video
    this.videos.push(new CachedVideo(this.path, filenameGIF));

    // Get and save file.
    request(url).pipe(videoStream);
    return true;
  }
}

var mediaCache = new MediaCache('./tmp/videos/');

/**
* @brief Proxies an image from tweeter
*/
function _serveImage (req, res) {
  var proxyUrl = req.url;

  // Make sure we only serve images
  if (! (proxyUrl.endsWith('.png') || proxyUrl.endsWith('.jpg') || proxyUrl.endsWith('.jpeg') || proxyUrl.endsWith('.gif')))
  {
    console.log('Incorrect proxy url' + proxyUrl)
    res.end()
  }

  console.log('Proxying: ' + proxyUrl)
  proxyUrl = proxyUrl.replace('/tweetImage/', 'http://')

  request.get(proxyUrl).pipe(res)
}

module.exports = {
  serveImage: _serveImage,
  mediaCache: mediaCache
}
