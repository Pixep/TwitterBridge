var models = require('../models');
var bodyParser = require('body-parser');

module.exports = {
  setup: function(app) {

    // Retrieve easily POST variables
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    /**
     * @brief Returns the latest QR-code to use in the application
     */
    app.get('/api/qrcode', function (req, res) {
      var qrcode = models.qrcodeImage();
      qrcode.pipe(res);
    });

    /**
     * @brief Set current user of a machine
     */
    app.post('/api/setCurrentUser', function (req, res) {
      if (!models.setCurrentUser(req.body.id)) {
        res.sendStatus(400);
        return;
      }

      res.sendStatus(200);
    });

    /**
     * @brief Update user infos
     */
    app.post('/api/updateUser', function (req, res) {
      if (!models.updateUser(req.body.id, req.body.name, req.body.email)) {
        res.sendStatus(400);
        return;
      }

      res.sendStatus(200);
    });

    /**
     * @brief Record a beverage
     */
    app.post('/api/addBeverageToUser', function (req, res) {
      if (!models.addBeverageToUser(req.body.beverageId, req.body.beverageName)) {
        res.sendStatus(400);
        return;
      }

      res.sendStatus(200);
    });

    /**
     * @brief Get coffee consumptions
     */
    app.get('/api/consumptions', function (req, res) {
      models.consumptions(function(err, results) {
        if (err) {
          res.sendStatus(400);
          return;
        }
      
        res.json(results);
      })
    });

    /**
     * @brief List all users
     */
    app.get('/api/users', function (req, res) {
      var results = models.users(function(err, results) {
        if (err) {
          res.sendStatus(400);
          return;
        }

        res.json(results);
      });
    });

    /**
     * @brief Reset current user
     */
    app.get('/api/resetCurrentUser', function (req, res) {
      models.resetCurrentUser();
    });

    /**
     * @brief Get current user
     */
    app.get('/api/currentUser', function (req, res) {
      res.json(models.currentUser());
    });

    /**
     * @brief Get user infos
     */
    app.post('/api/userInfo', function (req, res) {
      models.userInfo(req.body.id, function(err, results) {
        if (err) {
          res.sendStatus(400);
          return;
        }

        res.json(results);
      })
    });

    /**
     * @brief Get user infos
     */
    app.get('/api/beveragesRatings', function (req, res) {
      models.beveragesRatings( function(results) {
        res.json(results);
      });
    });

    /**
     * @brief Rate a beverage
     */
    app.post('/api/rateBeverage', function (req, res) {
      models.rateBeverage(req.body.id, req.body.beverageId, req.body.rating, req.body.comment);
      res.sendStatus(200);
    });
  }
}
