const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const { makeUser } = require('../community.js');
const { makeCommunity } = require('../community.js');

describe('User', function() {
    it('should create & initialise a new user', function() {
        let alice = makeUser('alice', 'alice@mail.com')
        alice.userName.should.equal('alice')
        alice.userEmail.should.equal('alice@mail.com')
    });
    it('should create & initialise a new community', function() {
        let alice = makeUser('alice', 'alice@mail.com')
        let community = makeCommunity('cs5003', alice)
        community.communityName.should.equal('cs5003')
        community.admin.should.equal(alice)
        community.users.should.include(alice)
        alice.communities.should.include(community)
        alice.adminCommunities.should.include(community)
    });
    it('should add user to community', function() {
        let alice = makeUser('alice', 'alice@mail.com')
        let bob = makeUser('bob', 'bob@mail.com')
        let community = makeCommunity('cs5003', alice)
        community.addUser(bob)
        community.users.should.include(bob)
        bob.communities.should.include(community)
        bob.adminCommunities.should.not.include(community)
    });
    it('should remove user from community', function() {
        let alice = makeUser('alice', 'alice@mail.com')
        let bob = makeUser('bob', 'bob@mail.com')
        let community = makeCommunity('cs5003', alice)
        community.addUser(bob)
        community.removeUser(bob)
        community.users.should.not.include(bob)
        bob.communities.should.not.include(community)
    });
    it("should not remove admin from community", function() {
        let alice = makeUser('alice', 'alice@mail.com')
        let community = makeCommunity('cs5003', alice)
        let removeAdmin = () => community.removeUser(alice)
        expect(removeAdmin).to.throw(Error, /Cannot remove admin/);
    });
})