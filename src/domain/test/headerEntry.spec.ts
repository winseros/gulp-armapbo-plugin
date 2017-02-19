import { HeaderEntry } from '../headerEntry';
import { PackingMethod } from '../packingMethod';
import { expect } from 'chai';

describe('domain/headerEntry', () => {
    describe('ctor', () => {
        it('should throw if called with illegal args', () => {
            const any = null as any;
            expect(() => new HeaderEntry(any, any, any, any)).to.throw(/name/);
        });

        it('should initialize object', () => {
            const entry = new HeaderEntry('entryName', PackingMethod.product, 10, 30);

            expect(entry.name).to.equal('entryName');
            expect(entry.packingMethod).to.equal(PackingMethod.product);
            expect(entry.originalSize).to.equal(10);
            expect(entry.reserved).to.equal(0);
            expect(entry.timestamp).to.equal(30);
        });
    });

    describe('getSize', () => {
        it('should calculate the size', () => {
            const entry = new HeaderEntry('entryName', PackingMethod.product, 10, 30);
            const size = entry.getSize();
            expect(size).to.equal(30);
        });
    });
});