******************************************************************
************ README - CS5003 Practical 3 - Group 20 **************
******************************************************************

==================================================================
==================== 1. MongoDB setup ============================
==================================================================

We use a config-db.js file that hold the configuration required for the data base.
It follows the structure of the one from the lectures, although we're specifying multiple collections.
Hence, the config-db.js should look like this:

(function() {
    const db_info = {
        url:'localhost',
        username: '******',
        password: '*****',
        port: '******',
        database: 'mongo_db',
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

The file should be located in the same directory as server.js. We provided a sample file that only needs to
be changed to conform with your personal settings.

==================================================================
==================== 2. Creating starter data ====================
==================================================================

We provide a script that fills the data base with tests data by running.

`node starterData/daoSandbox.js`

This will initiate the database and create 32 random users with random communities, threads, comments etc.
The 32 usernames that are created are the following:

names = [
        'barry', 'tom', 'farley', 'lemoine', 'chrystelle', 'honey', 'kwame', 'holden', 'abdoulaye',
        'crew', 'courtney', 'irvin', 'sherman', 'jeffrey', 'vanessa', 'kermit', 'racquel',
        'magalie', 'ange', 'rita', 'norene', 'pierce', 'carlisa', 'rochus', 'jean-paul', 'jayla',
        'paulette', 'merril', 'esther', 'toni', 'maddox', 'chloe'
    ]

You can login to any of these users with the credentials:

username: <name>
password: <name>123

e.g. to login with user barry, the username is barry and the password is barry123.

As the user data is created randomly from some arrays of possible data, you can check out different users
to see how the experience is depending on how many communities the user is a part of etc.

==================================================================
==================== 3. Running the server =======================
==================================================================

After installing the node modules (npm install), you can run the server using

`npm start`

or

`node server.js`

This will initialise the data base connection and start the server on PORT 3000.

==================================================================
==================== 4. Unit tests ===============================
==================================================================

To run the unit tests, simply run

`npm tests`

from the project directory.
