var qr = require('qr-image');

module.exports = {
  qrcodeImage: function() {
      return qr.image('http://witekio-coffee.com', { type: 'png' });
  }
}
