import { expect } from 'chai';
import * as sinon from 'sinon';
import { PboBodyWriter } from '../pboBodyWriter';
import { LzhCompressor } from '../lzh/lzhCompressor';
import { Header } from '../../domain/header';
import { HeaderEntry } from '../../domain/headerEntry';
import { PackingMethod } from '../../domain/packingMethod';

describe('core/pboBodyWriter', () => {

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('writeBody', () => {
        it('should write entries and return written bytes count', () => {
            const entry1 = { contents: Buffer.allocUnsafe(10) } as any;
            const entry2 = { contents: Buffer.allocUnsafe(15) } as any;
            const header = new Header([], [entry1, entry2]);

            const stubWrite = sandbox.stub(PboBodyWriter.prototype, '_writeEntry');
            stubWrite.onFirstCall().returns(entry1.contents.length)
                .onSecondCall().returns(entry2.contents.length);

            const buf = Buffer.allocUnsafe(entry1.contents.length + entry2.contents.length);
            const written = new PboBodyWriter().writeBody(buf, header);

            expect(written).to.equal(entry1.contents.length + entry2.contents.length);

            expect(stubWrite.callCount).to.equal(2);
            expect(stubWrite.withArgs(buf, entry1, 0).callCount).to.equal(1);
            expect(stubWrite.withArgs(buf, entry2, entry1.contents.length).callCount).to.equal(1);
        });
    });

    describe('_writeEntry', () => {
        it('should write entry uncompressed if packing method is "uncompressed"', () => {
            const stubUncompressed = sandbox.stub(PboBodyWriter.prototype, '_writeUncompressed');
            const stubCompressed = sandbox.stub(PboBodyWriter.prototype, '_writeCompressed');

            stubUncompressed.returns(1);
            stubCompressed.returns(2);

            const entry = new HeaderEntry('', PackingMethod.uncompressed, 0, 0);
            const buf = Buffer.allocUnsafe(10);

            const writer = new PboBodyWriter();
            const written = writer._writeEntry(buf, entry, 2);

            expect(written).to.equal(1);
            expect(entry.dataSize).to.equal(1);

            expect(stubUncompressed.callCount).to.equal(1);
            expect(stubCompressed.callCount).to.equal(0);

            expect(stubUncompressed.thisValues[0]).to.equal(writer);
            expect(stubUncompressed.withArgs(buf, entry, 2).callCount).to.equal(1);
        });

        it('should write entry compressed if packing method is "packed"', () => {
            const stubUncompressed = sandbox.stub(PboBodyWriter.prototype, '_writeUncompressed');
            const stubCompressed = sandbox.stub(PboBodyWriter.prototype, '_writeCompressed');

            stubUncompressed.returns(1);
            stubCompressed.returns(2);

            const entry = new HeaderEntry('', PackingMethod.packed, 0, 0);
            const buf = Buffer.allocUnsafe(10);

            const writer = new PboBodyWriter();
            const written = writer._writeEntry(buf, entry, 2);

            expect(written).to.equal(2);
            expect(entry.dataSize).to.equal(2);

            expect(stubUncompressed.callCount).to.equal(0);
            expect(stubCompressed.callCount).to.equal(1);

            expect(stubCompressed.thisValues[0]).to.equal(writer);
            expect(stubCompressed.withArgs(buf, entry, 2).callCount).to.equal(1);
        });
    });

    describe('_writeUncompressed', () => {
        it('should write data to buffer', () => {
            const entry = new HeaderEntry('', PackingMethod.packed, 0, 0);
            entry.contents = Buffer.from([0x01, 0x02, 0x03]);

            const buf = Buffer.alloc(10);
            const written = new PboBodyWriter()._writeUncompressed(buf, entry, 3);

            expect(written).to.equal(3);

            const expected = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x00, 0x00, 0x00, 0x00]);
            expect(buf).to.eql(expected);
        });
    });

    describe('_writeCompressed', () => {
        it('should write compressed data to buffer', () => {
            const stubCompressed = sandbox.stub(LzhCompressor.prototype, 'writeCompressed');
            const stubUncompressed = sandbox.stub(PboBodyWriter.prototype, '_writeUncompressed');

            stubCompressed.returns(1);
            stubUncompressed.returns(2);

            const entry = new HeaderEntry('', PackingMethod.packed, 0, 0);
            entry.contents = Buffer.allocUnsafe(5);

            const buf = Buffer.allocUnsafe(10);
            const written = new PboBodyWriter()._writeCompressed(buf, entry, 100500);

            expect(written).to.equal(1);

            expect(stubUncompressed.callCount).to.equal(0);
            expect(stubCompressed.callCount).to.equal(1);
            expect(stubCompressed.withArgs(entry.contents, buf, 100500).callCount).to.equal(1);
        });
    });
});