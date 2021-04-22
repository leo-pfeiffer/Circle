const {images} = require("./testImageData");

/**
 * Add users from an array to a community.
 * @param {Community} community
 * @param {Array<User>} users
 * */
const {Community, Event, User, Comment, Thread} = require("../models");
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
 * Add threads from an array to a community.
 * @param {Community} community
 * @param {Array<Thread>} threads
 * */
const addThreadsToCommunity = function(community, threads) {
    for (let thread of threads) {
        community.addThread(thread);
    }
}

/**
 * Add comments from array to thread.
 * @param {Thread} thread
 * @param {Array<comment>} comments
 * */
const addCommentsToThread = function(thread, comments) {
    for (let comment of comments) {
        thread.addComment(comment);
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
 * Return random date in march, april or may of 2021.
 * */
const randomDateNearby = function() {
    let year = 2021;
    let month = parseInt(Math.random() * 3 + 3);
    let day = parseInt(Math.random() * 31)
    let hour = parseInt(Math.random() * 23)
    let minute = parseInt(Math.random() * 59)
    return new Date(year, month, day, hour, minute);
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
    // fix ID for testing purposes
    adrian.id = "e0cc6987-121e-4181-bc9f-0a4c0cff2bda"
    addInterestsToUser(adrian, ['hobby1', 'hobby2', 'hobby3'])

    const betty = new User('betty', 'mail')
    const jon = new User('jon', 'mail')
    const darren = new User('darren', 'mail')
    const aida = new User('aida', 'mail')

    const brunch = new Event('Brunch', 'Yummie brunch', adrian, new Date(2021, 3, 20))
    const lunch = new Event('Lunch', 'Yummie lunch', adrian, new Date(2021, 3, 21))
    const dinner = new Event('Dinner', 'Yummie dinner', adrian, new Date(2021, 3, 22))

    const comment1 = new Comment('some interesting text1', adrian)
    comment1.datetime = new Date(2015, 1, 1)
    const comment2 = new Comment('some interesting text2', adrian)
    comment2.datetime = new Date(2016, 1, 1)
    const comment3 = new Comment('some interesting text3', adrian)
    comment3.datetime = new Date(2017, 1, 1)
    const comment4 = new Comment('some interesting text4', adrian)
    comment4.datetime = new Date(2018, 1, 1)
    const comment5 = new Comment('some interesting text5', betty)
    comment5.datetime = new Date(2019, 1, 1)

    const thread1 = new Thread('some text', 'some title1', adrian)
    const thread2 = new Thread('some text', 'some title2', jon)
    thread1.id = "2eec1791-d327-43b0-b7bf-1e6cfad7a498"

    addCommentsToThread(thread1, [comment1, comment2, comment3])
    addCommentsToThread(thread2, [comment4, comment5])

    const comF = new Community('F', adrian)
    addUsersToCommunity(comF, [jon, darren, aida])
    addTagsToCommunity(comF, ['hobby1', 'hobby3', 'hobby5'])
    addEventsToCommunity(comF, [brunch, lunch])
    comF.description = "This is an amazing community called F."
    // fix ID for testing purposes
    comF.id = "c50fc1fb-55c3-4f09-8774-59150286bfb4";

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
    addThreadsToCommunity(comI, [thread1, thread2])
    // fix ID for testing purposes
    comI.id = "85958011-170d-442b-ad20-0e871fc3e021"
    comI.description = "This is an amazing community called I."

    const comJ = new Community('J', jon)
    addUsersToCommunity(comJ, [betty])
    addTagsToCommunity(comJ, ['hobby1', 'hobby5'])

    let users = [adrian, jon, betty, aida, darren]
    let communities = [comF, comG, comH, comI, comJ]

    return {users, communities, adrian}
}

const makeStarterData = function() {

    const users = []
    const logins = []
    const communities = []

    const hobbies = [
        'fishing', 'gardening', 'sports', 'reading', 'horses', 'dogs', 'gym', 'workouts',
        'guitar', 'piano', 'coding', 'computers', 'running', 'cats', 'wrestling',
        'party', 'surfing', 'videography', 'photography', 'youtube', 'movies', 'music', 'singing',
        'cooking', 'poetry'
    ]

    const locations = [
        'Munich', 'London', 'Frankfurt', 'Edinburgh', 'Glasgow', 'St Andrews'
    ]

    const randomHobbies = (n) => hobbies.sort(() => 0.5 - Math.random()).slice(0, n)
    const randomUsers = (n) => users.sort(() => 0.5 - Math.random()).slice(0, n)

    // 32 names
    const names = [
        'barry', 'tom', 'farley', 'lemoine', 'chrystelle', 'honey', 'kwame', 'holden', 'abdoulaye',
        'crew', 'courtney', 'irvin', 'sherman', 'jeffrey', 'vanessa', 'kermit', 'racquel',
        'magalie', 'ange', 'rita', 'norene', 'pierce', 'carlisa', 'rochus', 'jean-paul', 'jayla',
        'paulette', 'merril', 'esther', 'toni', 'maddox', 'chloe'
    ]

    for (let name of names) {
        let user = new User(name, `${name}@mail.com`)

        // add random age
        user.age = parseInt(Math.random() * 20 + 18)

        // add random location
        user.location = locations[parseInt(Math.random() * locations.length)]

        // add random picture
        user.picture = images[parseInt(Math.random() * images.length)]

        // add random interests
        addInterestsToUser(user, randomHobbies(3))

        // save to the relevant arrays
        users.push(user)
        logins.push({username: name, password: `${name}123`})
    }

    const communityData = [
        [
            'Sports', ['gym', 'workout', 'running', 'wrestling'], randomUsers(7),

            [
                {
                    thread: ['Recent workouts', 'Tell us about your most recent workouts!'],
                    comments: ['Just benched 100kg for the first time:)', 'Just went on an amazing run!']
                },
                {
                    thread: ['Workout ideas', 'What are the coolest workout ideas'],
                    comments: ['Sleep, train, repeat', 'Calisthenics > Crossfit', 'Is chess a sport?']
                }
            ],
            [
                {
                    title: 'Outdoor workout',
                    description: 'workout with us in the park',
                    location: 'park',
                    link: 'www.example.com'
                },
                {
                    title: 'Indoor workout',
                    description: 'workout with us in the gym',
                    location: 'gym',
                    link: 'www.example.com'
                },
                {
                    title: 'Run by the beach',
                    description: '5k run at the beach',
                    location: 'East Sands',
                    link: 'www.example.com'
                },
            ]

        ],

        [
            'CS5003', ['coding', 'programming', 'javascript', 'computers'], randomUsers(7),

            // threads
            [
                {
                    thread: ['Practical 1', 'All about the first practical'],
                    comments: ['Not sure about Vue', 'Why does CSS take so much time?']
                },
                {
                    thread: ['Practical 3', 'All about the second practical'],
                    comments: ['MongoDB .. I miss SQL', 'Node rocks', 'Algorithms > Frontend']
                }
            ],
            [
                {
                    title: 'Meeting',
                    description: 'Discuss project',
                    location: 'MS Teams',
                    link: 'www.example.com'
                },
                {
                    title: 'Meeting',
                    description: 'Discuss project status',
                    location: 'MS Teams',
                    link: 'www.example.com'
                },
                {
                    title: 'Deadline',
                    description: 'Get it done on time!',
                    location: 'St Andrews',
                    link: 'www.example.com'
                },
            ]
        ],

        [
            'St Andrews', ['uni', 'studying', 'scotland'], randomUsers(7),
            // threads
            [
                {
                    thread: ['Housing', 'Post offers etc.'],
                    comments: ['Got a nice flat in North street', 'Ayton House got an amazing gym']
                },
                {
                    thread: ['Parties', 'Where to go tonight'],
                    comments: ['Union, obviously...', 'Party at my house.']
                }
            ],
            [
                {
                    title: 'Party',
                    description: 'BYOB',
                    location: 'North Street',
                    link: 'www.example.com'
                },
                {
                    title: 'Party',
                    description: 'Food and drinks provided',
                    location: 'Gannochy',
                    link: 'www.example.com'
                },
            ]

        ],

        [
            'Gardening', ['outdoors', 'flowers', 'trees', 'seeds'], randomUsers(7),
            [
                {
                    thread: ['Favourite flowers', 'all about your fav flowers'],
                    comments: ['tbh, poppies are amazing']
                },
            ],
            [
                {
                    title: 'Trade show',
                    description: 'look at plants together',
                    location: 'Edinburgh',
                    link: 'www.example.com'
                },
                {
                    title: 'Garden party',
                    description: 'Food and drinks provided',
                    location: 'My garden',
                    link: 'www.example.com'
                },
            ]
        ],

        [
            'Arts', ['videography', 'photography', 'singing', 'piano'], randomUsers(7),
            [
                {
                    thread: ['Favourite instrument', 'piano, guitar, ... ?'],
                    comments: ['been playing the piano for 10 years', 'just started playing the flute']
                }
            ],
            [
                {
                    title: 'Gallery tour',
                    description: 'look at sculptures',
                    location: 'Edinburgh',
                    link: 'www.example.com'
                },
                {
                    title: 'Exposition',
                    description: 'Performing arts and other stuff',
                    location: 'London',
                    link: 'www.example.com'
                },
            ]
        ],

        [
            'Internet', ['youtube', 'facebook', 'socials', 'computers'], randomUsers(7),
            [
                {
                    thread: ['Who is your fav youtuber?', 'let us know...'],
                    comments: ['graham stephen is pretty good :)', 'what ever the algorithm recommends']
                }
            ],
            [
                {
                    title: 'Livestream',
                    description: 'WOW',
                    location: 'Youtube',
                    link: 'www.youtube.com'
                },
            ]
        ],

        [
            'Food', ['cooking', 'chicken', 'veggie'], randomUsers(7),
            [
                {
                    thread: ['Favourite foods?', 'Whatever it is - tell us!'],
                    comments: ['chicken, chicken, chicken', 'miso soup', 'pancakes']
                }
            ],
            [
                {
                    title: 'Gordon Ramsey',
                    description: 'Watch with us',
                    location: 'TV',
                    link: 'www.example.com'
                },
            ]
        ],

    ]

    for (let com of communityData) {
        let community = new Community(com[0], com[2][0])
        addTagsToCommunity(community, com[1])
        addUsersToCommunity(community, com[2].slice(1, 7))

        for (let th of com[3]) {
            let thread = new Thread(th.thread[0], th.thread[1], community.users[parseInt(Math.random() * community.users.length)])

            for (let cmts of th.comments) {
                let comment = new Comment(cmts, community.users[parseInt(Math.random() * community.users.length)])
                thread.addComment(comment)
            }

            community.addThread(thread)

        }

        for (let ev of com[4]) {
            let event = new Event(ev.title, ev.description, community.users[parseInt(Math.random() * community.users.length)], randomDateNearby())
            event.link = ev.link
            event.location = ev.location
            community.addEvent(event)
        }

        communities.push(community)
    }

    return {communities, users, logins}

}

module.exports = {
    makePageRankDemoData: makePageRankDemoData,
    makeGeneralTestData: makeGeneralTestData,
    makeStarterData: makeStarterData
};
