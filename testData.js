/**
 * Add users from an array to a community.
 * @param {Community} community
 * @param {Array<User>} users
 * */
const {Community, Event, User} = require("./models");
const addUsersToCommunity = function(community, users) {
    for (let user of users) {
        community.addUser(user)
    }
}

/**
 * Add tags from an array to a the tags of a community.
 * @param {Community} community
 * @param {Array<string>} tags
 * */
const addTagsToCommunity = function(community, tags) {
    for (let tag of tags) {
        community.addTag(tag)
    }
}

/**
 * Add events from an array to a community.
 * @param {Community} community
 * @param {Array<Event>} events
 * */
const addEventsToCommunity = function(community, events) {
    for (let event of events) {
        community.addEvent(event);
    }
}


/**
 * Add interests from an array to a user.
 * @param {User} user
 * @param {Array<string>} interests
 * */
const addInterestsToUser = function(user, interests) {
    for (let interest of interests) {
        user.addInterest(interest)
    }
}

/**
 * Make demo data to test page rank
 * */
const makePageRankDemoData = function() {

    const peter = new User('peter', 'mail')
    addInterestsToUser(peter, ['hobby1', 'hobby2', 'hobby3'])

    const tom = new User('tom', 'mail')
    const anna = new User('anna', 'mail')
    const jenny = new User('jenny', 'mail')
    const fred = new User('fred', 'mail')

    const comA = new Community('A', peter)
    addUsersToCommunity(comA, [tom, anna, jenny])
    addTagsToCommunity(comA, ['hobby1', 'hobby3', 'hobby5'])

    const comB = new Community('B', peter)
    addUsersToCommunity(comB, [anna, fred])
    addTagsToCommunity(comB, ['hobby3'])

    const comC = new Community('C', peter)
    addUsersToCommunity(comC, [tom, jenny])
    addTagsToCommunity(comC, ['hobby4', 'hobby5'])

    const comD = new Community('D', fred)
    addUsersToCommunity(comD, [tom, jenny])
    addTagsToCommunity(comD, ['hobby1', 'hobby2', 'hobby3'])

    const comE = new Community('E', anna)
    addUsersToCommunity(comE, [jenny])
    addTagsToCommunity(comE, ['hobby1', 'hobby5'])

    let users = [peter, anna, fred, tom, jenny]
    let communities = [comA, comB, comC, comD, comE]

    return {users, communities, peter}
}

/**
 * Make some more demo data
 * */
const makeGeneralTestData = function() {

    const adrian = new User('adrian', 'mail')
    addInterestsToUser(adrian, ['hobby1', 'hobby2', 'hobby3'])

    const betty = new User('betty', 'mail')
    const jon = new User('jon', 'mail')
    const darren = new User('darren', 'mail')
    const aida = new User('aida', 'mail')

    const brunch = new Event('Brunch', 'Yummie brunch', adrian, new Date(2021, 3, 20))
    const lunch = new Event('Lunch', 'Yummie lunch', adrian, new Date(2021, 3, 21))
    const dinner = new Event('Dinner', 'Yummie dinner', adrian, new Date(2021, 3, 22))

    const comF = new Community('F', adrian)
    addUsersToCommunity(comF, [jon, darren, aida])
    addTagsToCommunity(comF, ['hobby1', 'hobby3', 'hobby5'])
    addEventsToCommunity(comF, [brunch, lunch])

    const comG = new Community('G', betty)
    addUsersToCommunity(comG, [jon, darren])
    addTagsToCommunity(comG, ['hobby3'])

    const comH = new Community('H', aida)
    addUsersToCommunity(comH, [betty, darren])
    addTagsToCommunity(comH, ['hobby4', 'hobby5'])

    const comI = new Community('I', darren)
    addUsersToCommunity(comI, [jon, betty, adrian])
    addTagsToCommunity(comI, ['hobby1', 'hobby2', 'hobby3'])
    addEventsToCommunity(comI, [dinner])

    const comJ = new Community('J', jon)
    addUsersToCommunity(comJ, [betty])
    addTagsToCommunity(comJ, ['hobby1', 'hobby5'])

    let users = [adrian, jon, betty, aida, darren]
    let communities = [comF, comG, comH, comI, comJ]

    return {users, communities, adrian}
}

module.exports = {
    makePageRankDemoData: makePageRankDemoData,
    makeGeneralTestData: makeGeneralTestData
};
