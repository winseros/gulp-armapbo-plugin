import { PboHeaderExtension } from '../pboHeaderExtension';
import { expect } from 'chai';

describe('domain/pboHeaderExtension', () => {
    describe('ctor', () => {
        it('should throw if called with illegal args', () => {
            expect(() => new PboHeaderExtension(null as any, null as any)).to.throw(/name/);
            expect(() => new PboHeaderExtension('some-name', null as any)).to.throw(/value/);
        });

        it('should initialize object', () => {
            const extension = new PboHeaderExtension('ext-name', 'some-value');

            expect(extension.name).to.equal('ext-name');
            expect(extension.value).to.equal('some-value');
        });
    });

    describe('getSize', () => {
        it('return a valid package size', () => {
            const extension = new PboHeaderExtension('ext-name', 'some-value');
            const size = extension.getSize();
            expect(size).to.equal(20);
        });
    });

    describe('getBoundary', () => {
        it('returns a boundary entry', () => {
            const entry = PboHeaderExtension.getBoundary();

            expect(entry).not.to.equal(null);
            expect(entry).not.to.equal(undefined);

            expect(entry.name).to.equal('');
            expect(entry.value).to.equal('');
        });
    });
});