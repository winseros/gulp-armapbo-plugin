import { HeaderExtension } from '../headerExtension';
import { expect } from 'chai';

describe('domain/headerExtension', () => {
    describe('ctor', () => {
        it('should throw if called with illegal args', () => {
            expect(() => new HeaderExtension(null as any, null as any)).to.throw(/name/);
            expect(() => new HeaderExtension('some-name', null as any)).to.throw(/value/);
        });

        it('should initialize object', () => {
            const extension = new HeaderExtension('ext-name', 'some-value');

            expect(extension.name).to.equal('ext-name');
            expect(extension.value).to.equal('some-value');
        });
    });

    describe('getSize', () => {
        it('return a valid package size', () => {
            const extension = new HeaderExtension('ext-name', 'some-value');
            const size = extension.getSize();
            expect(size).to.equal(20);
        });
    });

    describe('getBoundary', () => {
        it('returns a boundary entry', () => {
            const entry = HeaderExtension.getBoundary();

            expect(entry).not.to.equal(null);
            expect(entry).not.to.equal(undefined);

            expect(entry.name).to.equal('');
            expect(entry.value).to.equal('');
        });
    });
});