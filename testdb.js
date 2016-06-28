// https://github.com/azat-co/practicalnode/tree/master/ch5
var util = require('util');
var mongo = require('mongodb'); // npm install mongodb@latest
var dbHost = '127.0.0.1';
var dbPort = 27017;

var Db = mongo.Db;
var Connection = mongo.Connection;
var Server = mongo.Server;
var db = new Db('local', new Server(dbHost, dbPort), {safe: true});

db.open(function (error, dbConnection) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  // console.log('db state: ', db._state);

  dbConnection.collection('message').findOne({}, function (error, item) {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log('findOne: ', item);

    item.text = 'xin chao';
    item.name = 'Trung Dang';
    var id = item._id.toString();
    console.log('before saving: ', item);
    dbConnection.collection('message').save(item, function (error, item) {
      console.log('save: ', item);
      // dbConnection.collection('message').find({_id: new mongo.ObjectID(id)}).toArray(function (error, items) {
      //   console.log('find: ', items);
      //   db.close();
      //   process.exit(0);
      // });

    });
  });

  // dbConnection.collection('message').insert(item, function (error, item) {
  //   if (error) {
  //     console.log(error);
  //     process.exit(1);
  //   }
  //   console.log('created/inserted: ', item);
  //   db.close();
  //   process.exit(0);

  // });


});