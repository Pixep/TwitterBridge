var Request = require('request')

module.exports = {
  /**
  * @brief Proxies an image from tweeter
  */
  proxyImage: function (req, res) {
    var proxyUrl = req.url;

    // Make sure we only serve images
    if (! (proxyUrl.endsWith('.png') || proxyUrl.endsWith('.jpg') || proxyUrl.endsWith('.jpeg') || proxyUrl.endsWith('.gif')))
    {
      console.log('Incorrect proxy url' + proxyUrl)
      res.end()
    }

    console.log('Proxying: ' + proxyUrl)
    proxyUrl = proxyUrl.replace('/tweetImage/', 'http://')

    Request.get(proxyUrl).pipe(res)
  }
}
