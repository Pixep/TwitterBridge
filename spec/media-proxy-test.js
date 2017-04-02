var mediaProxy = require('../libs/media-proxy');
var should = require('chai').should();
var expect = require('chai').expect;
var sinon = require('sinon');
var mockery = require('mockery');

describe('Image proxy', function () {
  before(function() {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    requestStub = sinon.stub();
    mockery.registerMock('request', requestStub)
  });

  it('should fails if the path does not points to an image', function (done) {
    var req = {
      url: "/tweetImage/t.co/Ojdz8hH.php"
    };
    var res = {
      end: function () {
        done();
      }
    };

    mediaProxy.serveImage(req, res);
  });

  it('should work for images', function (done) {
    var req = {
      url: "/tweetImage/t.co/Ojdz8hH.png"
    };
    var res = {
      called: false,
      on: function(data) {
        if (!this.called)
          done();

        this.called = true;
      },
      end: function() {}
    };

    mediaProxy.serveImage(req, res);
  });

  after(function() {
    mockery.disable();
  });
});

describe('Video caching', function () {
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

  it('should delete older videos only', function (done) {
    mediaProxy.mediaCache.deleteUnusedVideos();

    var videoFilepath = mediaProxy.mediaCache.video('other-video.gif');
    videoFilepath.should.equal(mediaProxy.mediaCache.path + 'other-video.gif');
    done();
  });

  describe('#_cachedVideo()', function () {
    it('should return a specific cached video', function (done) {

      var video = mediaProxy.mediaCache._cachedVideo('non-existing-video.gif');
      expect(video).to.be.null;
      video = mediaProxy.mediaCache._cachedVideo('other-video.gif');
      expect(video).to.exist;
      done();
    })
  });

  describe('#_deleteCachedVideo()', function () {
    it('should delete a specific cached video', function (done) {
      video = mediaProxy.mediaCache._cachedVideo('other-video.gif');
      expect(video).to.exist;

      // Verify it calls delete
      var deleteSpy = sinon.spy();
      var stub = sinon.stub(video, "deleteFile").callsFake(deleteSpy);
      mediaProxy.mediaCache._deleteCachedVideo(video);
      expect(deleteSpy.called).to.be.true;

      // Verify it was removed from the list
      video = mediaProxy.mediaCache._cachedVideo('other-video.gif');
      expect(video).to.be.null;

      done();
    })
  });
})
