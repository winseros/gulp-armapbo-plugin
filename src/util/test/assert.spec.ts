import { expect } from 'chai';
import { Assert } from '../assert';

describe('util/assert', () => {
    describe('isString', () => {
        it('should throw if called with illegal args', () => {
            expect(() => Assert.isString('', null as any)).to.throw(/paramName/);
        });

        it('should throw if input is null', () => {
            expect(() => Assert.isString(null as any, 'someString')).to.throw('someString should be a non-empty string');
        });

        it('should throw if input is an empty string', () => {
            expect(() => Assert.isString('', 'someString')).to.throw('someString should be a non-empty string');
        });

        it('should throw if input is a whitespace string', () => {
            expect(() => Assert.isString('   \t  ', 'someString')).to.throw('someString should be a non-empty string');
        });

        it('should throw if input is a whitespace string', () => {
            expect(() => Assert.isString('   \t  ', 'someString')).to.throw('someString should be a non-empty string');
        });

        it('should throw if input is not a string', () => {
            expect(() => Assert.isString(123455 as any, 'someString')).to.throw('someString should be a non-empty string');
        });

        it('should pass if input is not a valid string', () => {
            expect(() => Assert.isString('abcd', 'someString')).not.to.throw();
        });
    });

    describe('isNotNull', () => {
        it('should throw if called with illegal args', () => {
            expect(() => Assert.isNotNull('', null as any)).to.throw(/paramName/);
        });

        it('should throw if input is null', () => {
            expect(() => Assert.isNotNull(null as any, 'someData')).to.throw('someData should not be null');
        });

        it('should throw if input is undefined', () => {
            expect(() => Assert.isNotNull(undefined as any, 'someData')).to.throw('someData should not be null');
        });

        it('should pass if input is not null', () => {
            expect(() => Assert.isNotNull({}, 'someData')).not.to.throw();
        });
    });
});