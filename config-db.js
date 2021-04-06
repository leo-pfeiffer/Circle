(function() {
const db_info = {url:'localhost',
username: 'webuser',
password: '<YOUR SUPER SECRET PASSWORD GOES HERE>',
port: '22767',
database: 'mongo_db',
collection: 'collection'};
const moduleExports = db_info;
if (typeof __dirname != 'undefined')
module.exports = moduleExports;
}());