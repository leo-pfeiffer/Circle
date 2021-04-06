(function() {
const db_info = {url:'localhost',
username: 'webuser',
password: 'mongoDB_24',
port: '22624',
database: 'mongo_db',
collection: 'collection'};
const moduleExports = db_info;
if (typeof __dirname != 'undefined')
module.exports = moduleExports;
}());