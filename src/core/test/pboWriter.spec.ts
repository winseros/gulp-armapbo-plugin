import { PboWriter } from '../pboWriter';
import { PboHeaderEntry, PackingMethod } from '../../domain/pboHeaderEntry';
import { PboHeaderExtension } from '../../domain/pboHeaderExtension';
import { expect } from 'chai';

describe('core/pboWriter', () => {
    describe('writeHeaderEntry', () => {
        it('should inflate buffer with entry data', () => {
            const entry = new PboHeaderEntry('entry-file-name', PackingMethod.packed, 100, Date.parse('2014-05-15T00:00:00+0300') / 1000, 120);

            const writer = new PboWriter();

            const buffer = new Buffer(entry.getSize());
            const offset = writer.writeHeaderEntry(buffer, entry, 0);

            expect(offset).to.equal(buffer.length);

            const expected = new Buffer([101, 110, 116, 114, 121, 45, 102, 105, 108, 101, 45, 110, 97, 109, 101, 0, 115, 114, 112, 67, 100, 0, 0, 0, 0, 0, 0, 0, 80, 217, 115, 83, 120, 0, 0, 0]);
            expect(buffer).to.eql(expected);
        });
    });

    describe('writeHeaderExtension', () => {
        it('should inflate buffer with extension data', () => {
            const extension = new PboHeaderExtension('extension-name', 'extension-value');

            const writer = new PboWriter();

            const buffer = new Buffer(extension.getSize());
            const offset = writer.writeHeaderExtension(buffer, extension, 0);

            expect(offset).to.equal(buffer.length);

            const expected = new Buffer([101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 110, 97, 109, 101, 0, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 118, 97, 108, 117, 101, 0]);
            expect(buffer).to.eql(expected);
        });
    });
});