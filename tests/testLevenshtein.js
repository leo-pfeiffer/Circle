const mocha = require('mocha');
const chai = require('chai');
const chaiAlmost = require('chai-almost');
const {calculateLevenshteinScore} = require("../recommendationSystem/levenshtein");

const should = chai.should();
const expect = chai.expect;

chai.use(chaiAlmost(0.01));


describe("Levenshtein", function() {
    it("should return expected values (normal input)", function() {
        let allCommunitiesTags = [
            {id: 'A', tags: ['hello', 'levenshtein']},
            {id: 'B', tags: ['test', 'this']}
        ];
        let userInterests = ['test', 'this'];
        let results = calculateLevenshteinScore(allCommunitiesTags, userInterests)
        Object.keys(results).should.include('A')
        Object.keys(results).should.include('B')
        Object.keys(results).length.should.equal(2)

        results.A.should.equal(6.5)
        results.B.should.equal(1.5)
    });
    it("should return same score for all communities if user interests is empty", function() {
        let allCommunitiesTags = [
            {id: 'A', tags: ['hello', 'levenshtein']},
            {id: 'B', tags: ['test', 'this']}
        ];
        let userInterests = [];
        let results = calculateLevenshteinScore(allCommunitiesTags, userInterests)
        Object.keys(results).should.include('A')
        Object.keys(results).should.include('B')
        Object.keys(results).length.should.equal(2)

        results.A.should.equal(1)
        results.B.should.equal(1)
    });
    it("should skip communities without tags", function() {
        let allCommunitiesTags = [
            {id: 'A', tags: ['hello', 'levenshtein']},
            {id: 'B', tags: []}
        ];
        let userInterests = ['test', 'this'];
        let results = calculateLevenshteinScore(allCommunitiesTags, userInterests)
        Object.keys(results).should.include('A')
        Object.keys(results).length.should.equal(1)

        results.A.should.equal(6.5)
    });
})