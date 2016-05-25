var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;

const cors = require('cors');



app.use(bodyParser.json());
app.use(cors());

// app.use(function (req, res, next) {
//
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
//
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);
//
//     // Pass to next layer of middleware
//     next();
// });

app.get('/', function(req, res) {
	res.send('BBS API Root');
});

app.get('/topics',function(req,res) {
	db.topic.findAll({attributes:['id','title'],

										include:[{model:db.user,attributes:['id','email']},
											{model:db.group,attributes:['id','title']}]})

					.then(function (topics) {
		res.json({topics});
	},function(e) {
		res.status(500).send();
	});
});

app.get('/users',function(req,res) {
	db.user.findAll({attributes:['email','password']})
					.then(function (users) {
		res.json({users});
	},function(e) {
		res.status(500).send();
	});
});
// create groups /post /groups
app.post('/groups',middleware.requireAuthentication,function(req,res) {
  debugger;
  var body=_.pick(req.body,'title');
  db.group.create(body).then(function(group) {
      res.json(group.toJSON());
  },function(e) {
    res.status(400).json(e);
  })
});
//create topic /post/topics
app.post('/topics',middleware.requireAuthentication,function(req,res) {
  var body=_.pick(req.body,'groupId','title','content');
  var topic={
    //groupId:body.groupId,
    title:body.title,
    content:body.content
  };
  db.topic.create(topic).then(function(topic) {
    db.group.findById(body.groupId).then(function(group) {
      group.addTopic(topic).then(function() {
        return topic.reload();
      }).then(function(topic) {
        req.user.addTopic(topic).then(
          function() {
            return topic.reload();
          }
        ).then(
          function(topic) {
            res.json(topic.toJSON());
          },
          function(e) {
            res.status(400).json(e);
          }
        );
      });
    });
  });
});

app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

// POST /users/login
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
	}).then(function (tokenInstance) {
		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function () {
		res.status(401).send();
	});
});

// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
	req.token.destroy().then(function () {
		res.status(204).send();
	}).catch(function () {
		res.status(500).send();
	});
});

// db.sequelize.sync({force: true}).then(function() {
db.sequelize.sync({force:true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});
