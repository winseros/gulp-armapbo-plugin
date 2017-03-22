import { expect } from 'chai';
import { PatternMatcher } from '../patternMatcher';

describe('core/patternMatcher', () => {
    describe('match', () => {
        it('should match a file name against series of patterns', () => {
            const matcher = PatternMatcher.create(['*.txt', '*.ext', '!1.txt', '!1.ext']);

            let match = matcher.match('1.txt');
            expect(match).to.equal(false);

            match = matcher.match('2.txt');
            expect(match).to.equal(true);

            match = matcher.match('1.ext');
            expect(match).to.equal(false);

            match = matcher.match('2.ext');
            expect(match).to.equal(true);
        });
    });
});