const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

const { User, Community, Thread, Comment } = require('../models.js');

describe('User and Community', function() {
    it('should create & initialise a new user', function() {
        let alice = new User('alice', 'alice@mail.com')
        alice.userName.should.equal('alice')
        alice.userEmail.should.equal('alice@mail.com')
    });
    it('should create & initialise a new community', function() {
        let alice = new User('alice', 'alice@mail.com')
        let community = new Community('cs5003', alice)
        community.communityName.should.equal('cs5003')
        community.admin.should.equal(alice)
        community.users.should.include(alice)
        alice.communities.should.include(community)
        alice.adminCommunities.should.include(community)
    });
    it('should add user to community', function() {
        let alice = new User('alice', 'alice@mail.com')
        let bob = new User('bob', 'bob@mail.com')
        let community = new Community('cs5003', alice)
        community.addUser(bob)
        community.users.should.include(bob)
        bob.communities.should.include(community)
        bob.adminCommunities.should.not.include(community)
    });
    it('should remove user from community', function() {
        let alice = new User('alice', 'alice@mail.com')
        let bob = new User('bob', 'bob@mail.com')
        let community = new Community('cs5003', alice)
        community.addUser(bob)
        community.removeUser(bob)
        community.users.should.not.include(bob)
        bob.communities.should.not.include(community)
    });
    it("should not remove admin from community", function() {
        let alice = new User('alice', 'alice@mail.com')
        let community = new Community('cs5003', alice)
        let removeAdmin = () => community.removeUser(alice)
        expect(removeAdmin).to.throw(Error, /Cannot remove admin/);
    });
})

describe("Comment and Thread", function() {
    it("should create a new thread", function() {
        let alice = new User('alice', 'alice@mail.com')
        let community = new Community('cs5003', alice)
        let thread = new Thread('hello', 'cs5003', alice, community)
        community.threads.should.include(thread)
        thread.author.should.equal(alice)
        alice.threads.should.include(thread)
    });
    it("should add a comment to a thread", function() {
        let alice = new User('alice', 'alice@mail.com')
        let community = new Community('cs5003', alice)
        let thread = new Thread('hello', 'cs5003', alice, community)
        let comment = new Comment('this is a text', alice, thread)
        comment.thread.should.equal(thread)
        alice.comments.should.include(comment)
        comment.author.should.equal(alice)
    });
    it("should not add a thread from a non-member", function() {
        let alice = new User('alice', 'alice@mail.com')
        let bob = new User('bob', 'bob@mail.com')
        let community = new Community('cs5003', alice)
        let nonMemberAddsThread = () => new Thread('hello', 'cs5003', bob, community)
        expect(nonMemberAddsThread).to.throw(Error, /Cannot add thread/);
    });
    it("should not add a comment to a thread from a non-member", function() {
        let alice = new User('alice', 'alice@mail.com')
        let bob = new User('bob', 'bob@mail.com')
        let community = new Community('cs5003', alice)
        let thread = new Thread('hello', 'cs5003', alice, community)
        let nonMemberAddsComment = () => new Comment('this is a text', bob, thread)
        expect(nonMemberAddsComment).to.throw(Error, /Cannot add comment/);
    });

})