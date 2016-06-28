var mongo = require('mongoskin'),
  dbHost = '127.0.0.1',
  dbPort = 27017;

// create instance of connection to MongoDB
var db = mongo.db('mongodb://' + dbHost + ':' + dbPort + '/rockband', {native_parser:true}); // authenticate
// db.bind('bands');
// db.bands.find().toArray(function (err, items) {
//   console.log(items);
// })

db.collection('bands').insert({name: "Guns N' Roses", members: ['Axl Rose', 'Slash', 'Izzy Stradlin', 'Matt Sorum', 'Duff McKagan'], year: 1986}, function (err, result) {
  console.log(result);
});
