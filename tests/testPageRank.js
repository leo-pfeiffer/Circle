const mocha = require('mocha');
const chai = require('chai');
const should = chai.should();
const expect = chai.expect;

describe("PageRank", function() {
    it("should  a new event", function() {
        let alice = new User('alice', 'alice@mail.com')
        let community = new Community('cs5003', alice)
        let event = new Event('title', 'some description', alice, new Date())
        community.addEvent(event)
        community.events.should.include(event);
    });
    it('should not create an event for a user who is not a member', function() {
        let alice = new User('alice', 'alice@mail.com')
        let bob = new User('bob', 'bob@mail.com')
        let community = new Community('cs5003', alice)
        let event = new Event('title', 'some description', bob, new Date());
        let nonMemberCreatesEvent = () => community.addEvent(event);
        expect(nonMemberCreatesEvent).to.throw(Error, /Cannot add event/);
    });
    it('should remove an event', function() {
        let alice = new User('alice', 'alice@mail.com')
        let community = new Community('cs5003', alice)
        let event = new Event('title', 'some description', alice, new Date())
        community.addEvent(event)
        community.removeEvent(event)
        community.events.should.not.include(event);
    })
})