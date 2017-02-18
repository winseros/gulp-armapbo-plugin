import { PboHeaderEntry, PackingMethod } from '../pboHeaderEntry';
import { expect } from 'chai';

describe('domain/pboHeaderEntry', () => {
    describe('ctor', () => {
        it('should throw if called with illegal args', () => {
            const any = null as any;
            expect(() => new PboHeaderEntry(any, any, any, any, any)).to.throw(/name/);
        });

        it('should initialize object', () => {
            const entry = new PboHeaderEntry('entryName', PackingMethod.product, 10, 30, 40);

            expect(entry.name).to.equal('entryName');
            expect(entry.packingMethod).to.equal(PackingMethod.product);
            expect(entry.originalSize).to.equal(10);
            expect(entry.reserved).to.equal(0);
            expect(entry.timestamp).to.equal(30);
            expect(entry.dataSize).to.equal(40);
        });
    });

    describe('getSize', () => {
        it('should calculate the size', () => {
            const entry = new PboHeaderEntry('entryName', PackingMethod.product, 10, 30, 40);
            const size = entry.getSize();
            expect(size).to.equal(30);
        });
    });
});