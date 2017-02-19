import { expect } from 'chai';
import { Header } from '../../domain/header';
import { HeaderEntry } from '../../domain/headerEntry';
import { HeaderExtension } from '../../domain/headerExtension';
import { PackingMethod } from '../../domain/packingMethod';
import { PboHeaderWriter } from '../pboHeaderWriter';

describe('core/pboHeaderWriter', () => {
    describe('writeHeader', () => {
        it('should write header to buffer', () => {
            const ext1 = new HeaderExtension('ext1n', 'ext1v');
            const ext2 = new HeaderExtension('ext2n', 'ext2v');
            const ent1 = new HeaderEntry('ent1', PackingMethod.uncompressed, 0, 0);
            const ent2 = new HeaderEntry('ent2', PackingMethod.uncompressed, 0, 0);

            const header = new Header([ext1, ext2], [ent1, ent2]);

            const writer = new PboHeaderWriter();
            const buf = Buffer.allocUnsafe(writer.measureHeader(header));
            writer.writeHeader(buf, header);

            const expected = Buffer.from([0x00, 0x73, 0x72, 0x65, 0x56, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,//signature
                0x65, 0x78, 0x74, 0x31, 0x6e, 0x00, 0x65, 0x78, 0x74, 0x31, 0x76, 0x00,//header1
                0x65, 0x78, 0x74, 0x32, 0x6e, 0x00, 0x65, 0x78, 0x74, 0x32, 0x76, 0x00,//header2
                0x00,//zero
                0x65, 0x6e, 0x74, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,//entry1
                0x65, 0x6e, 0x74, 0x32, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,//entry2
                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);//boundary

            expect(buf).to.eql(expected);
        });
    });

    describe('measureBody', () => {
        it('should compute the estimated body size', () => {
            const ent1 = new HeaderEntry('ent1', PackingMethod.uncompressed, 0, 0);
            const ent2 = new HeaderEntry('ent2', PackingMethod.uncompressed, 0, 0);

            ent1.contents = Buffer.allocUnsafe(10);
            ent2.contents = Buffer.allocUnsafe(15);

            const header = new Header([], [ent1, ent2]);

            const size = new PboHeaderWriter().measureBody(header);
            expect(size).to.equal(15);
        });
    });
});