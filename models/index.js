var qr = require('qr-image');
var MongoClient = require('mongodb').MongoClient;

// Database and collections
var db = null;
var usersCollection = null;
var beveragesConsumptionCollection = null;
var beveragesRatings = null;

// Connect to db
var url = 'mongodb://localhost:27017/witekio-coffee';
MongoClient.connect(url, function(err, database) {
  if (err) {
    console.log(err);
  }
  else {
    db = database;
    usersCollection = db.collection('customers');
    beveragesConsumptionCollection = db.collection('beveragesConsumption');
    beveragesRatingsCollection = db.collection('beveragesRatings');
  }
});

// Current user info
var currentUser = {};
currentUser.name = "";
var userResetTimeout;

function _resetCurrentUser() {
  console.log("Disconnected user " + currentUser.name);
  currentUser.name = "";
  currentUser.id = "";
  currentUser.email = "";
  currentUser.lastBeverageId = -1;

  if (userResetTimeout)
    clearTimeout(userResetTimeout); 
}

module.exports = {
  qrcodeImage: function() {
      return qr.image('http://witekio-coffee.com', { type: 'png' });
  },

  resetCurrentUser: _resetCurrentUser,

  setCurrentUser: function(userId) {
    if (currentUser.id) {
      console.log("setCurrentUser: user already connected !");
      return false;
    }

    if (!userId) {
      console.log("setCurrentUser: user id not set!");
      return false;
    }

    var beverages = usersCollection.find({id: userId}, {id: 1, name: 1, email:1, beverages:1, _id:0});
    beverages.toArray(function(err, docs) {
      if (docs && docs.length > 0 && docs[0].beverages) {
        currentUser.id = docs[0].id;
        currentUser.name = docs[0].name;
        currentUser.email = docs[0].email;
        currentUser.lastBeverageId = docs[0].beverages[docs[0].beverages.length-1].id;
        console.log("User " + currentUser.name + " flashed");
      }
    });

    userResetTimeout = setTimeout(() => {
      _resetCurrentUser();
    }, 60000);

    return true;
  },
  
  updateUser: function(userId, name, email) {
    if (!userId) {
      console.log("updateUser: user id not set!");
      return false;
    }

    currentUser.id = userId;
    currentUser.name = name;
    currentUser.email = email;

    usersCollection.update({id:currentUser.id}, {$set: {id: currentUser.id, name: currentUser.name, email: currentUser.email}}, {upsert: true});

    console.log("User " + currentUser.name + " updated");
    return true;
  },

  addBeverageToUser: function(beverageId, beverageName) {
    var timestamp = Date.now();

    beveragesConsumptionCollection.insertOne({id:beverageId, name:beverageName, price:0, date:timestamp}, function (err, res) {
      if (err)
        console.log("Failed to log beverage " + beverageName);
      else
        console.log("Logged beverage " + beverageName);
    });

    if (currentUser.id) {
      usersCollection.update({id:currentUser.id}, {$push:{beverages:{id: beverageId, name: beverageName, date: timestamp}}}, {upsert: true});
      console.log("User " + currentUser.name + "(" + currentUser.id + ") took a " + beverageName + "#" + beverageId);
    }

    _resetCurrentUser();
    return true;
  },

  consumptions: function(callback) {
    var results = beveragesConsumptionCollection.find({});
    results.toArray(function(err, docs) {
      if (err)
        console.log("consumptions: " + err);

      callback(docs);
    });
  },

  users: function(callback) {
    var results = usersCollection.find({});
    results.toArray(function(err, docs) {
      callback(docs);
    });
  },

  rateBeverage: function(userId, beverageId, rating, comment, callback) {
    if (!userId || !beverageId || !rating) {
      console.log("rateBeverage: user id, beverage id or rating not set!");
      
      if (callback)
        callback(true);
      return;
    }
    
    rating = parseInt(rating);

    var timestamp = Date.now();
    beveragesRatingsCollection.insertOne({beverageId: beverageId, userId: userId, rating: rating, comment: comment, date: timestamp}, function(err, res) {
      if (err) {
        console.log("Failed to insert rating for beverage id" + beverageId);
        if (callback) callback(true);
      }
      else {
        console.log("Beverage id " + beverageId + " rated " + rating);
        if (callback) callback(false);
      }
    });
  },

  beveragesRatings: function(callback) {
    var results = beveragesRatingsCollection.aggregate([{$group: {_id : "$beverageId", count: { $sum : 1 }, average: { $avg: "$rating" }}}]);
    results.toArray(function(err, docs) {
      if (err)
        console.log("beveragesRatings: " + err);

      callback(docs);
    });
  },

  currentUser: function() {
    return currentUser;
  },

  userInfo: function(userId, callback) {
    if (!userId) {
      console.log("userInfo: user id not set!");
      callback(true);
      return;
    }

    var beverages = usersCollection.find({id: userId}, {beverages:1, _id:0});
    beverages.toArray(function(err, docs) {
      var results = {
        count: 0
      };
      if (!docs || docs.length === 0) {
        callback(null, results);
        return;
      }

      var beverages = docs[0].beverages;
      if (!beverages) {
        callback(null, results);
        return;
      }

      results.count = beverages ? beverages.length : 0;
      results.latest = docs ? beverages[beverages.length-1].name : ""
      callback(null, results);
    });
  }
}
