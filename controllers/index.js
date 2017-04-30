var models = require('../models');

module.exports = {
  setup: function(app) {

    /**
     * @brief Returns the latest QR-code to use in the application
     */
    app.get('/qrcode', function (req, res) {
      var qrcode = models.qrcodeImage();
      qrcode.pipe(res);
    })
  }
}
