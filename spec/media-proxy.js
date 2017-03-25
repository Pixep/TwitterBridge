var mediaProxy = require('../libs/image-proxy');
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Video caching', function () {
  it('should fails if not an mp4', function (done) {
    var gifFilename = mediaProxy.mediaCache.videoAsGif('https://video.twimg.com/tweet_video/some-video.mp3');
    gifFilename.should.equal('');
    done();
  });

  it('should fails if not an mp4', function (done) {
    var gifFilename = mediaProxy.mediaCache.videoAsGif('https://video.twimg.com/tweet_video/some-video.mp3');
    gifFilename.should.equal('');
    done();
  });

  it('should return .gif filename for a video', function (done) {
    var gifFilename = mediaProxy.mediaCache.videoAsGif('https://video.twimg.com/tweet_video/some-video.mp4');
    gifFilename.should.equal('some-video.gif');
    done();
  });

  it('should return an empty filename when a video is not cached', function (done) {
    var ismediaCached = mediaProxy.mediaCache.contains('other-video.mp4');
    ismediaCached.should.equal(false);
    ismediaCached = mediaProxy.mediaCache.contains('other-video.gif');
    ismediaCached.should.equal(false);

    var videoFilepath = mediaProxy.mediaCache.video('other-video.mp4');
    videoFilepath.should.equal('');
    var videoFilepath = mediaProxy.mediaCache.video('other-video.gif');
    videoFilepath.should.equal('');
    done();
  });

  it('should return gif path when video is cached', function (done) {
    mediaProxy.mediaCache.videoAsGif('https://video.twimg.com/tweet_video/other-video.mp4');

    var ismediaCached = mediaProxy.mediaCache.contains('other-video.mp4');
    ismediaCached.should.equal(false);
    ismediaCached = mediaProxy.mediaCache.contains('other-video.gif');
    ismediaCached.should.equal(true);

    var videoFilepath = mediaProxy.mediaCache.video('other-video.mp4');
    videoFilepath.should.equal('');
    var videoFilepath = mediaProxy.mediaCache.video('other-video.gif');
    videoFilepath.should.equal(mediaProxy.mediaCache.path + 'other-video.gif');
    done();
  });
})
