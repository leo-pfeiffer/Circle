(function() {
    const db_info = {
        collection: {
            user_data: 'user_data',
            user_passwords: 'user_passwords',
            communities_data: 'communities_data'
        }
    };
    const moduleExports = db_info;
    if (typeof __dirname != 'undefined')
module.exports = moduleExports;
}());