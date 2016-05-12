var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}

var db = {};


db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');

db.topic=sequelize.import(__dirname+'/models/topic');
db.group=sequelize.import(__dirname+'/models/group');

db.sequelize = sequelize;
db.Sequelize = Sequelize;



db.topic.belongsTo(db.group);
db.topic.belongsTo(db.user);
db.group.hasMany(db.topic);
db.user.hasMany(db.topic);


module.exports = db;
