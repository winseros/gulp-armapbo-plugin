import { expect } from 'chai';
import * as sinon from 'sinon';
import { LzhCompressor } from '../lzhCompressor';
import { StackBuffer } from '../stackBuffer';
import { LzhPacket } from '../lzhPacket';

describe('core/lzh/lzhCompressor', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('writeCompressed', () => {
        it('should compress the source buffer', () => {
            const packet1 = { compose: sandbox.stub(), flush: sandbox.stub() };
            const packet2 = { compose: sandbox.stub(), flush: sandbox.stub() };
            const packet3 = { compose: sandbox.stub(), flush: sandbox.stub() };

            packet1.compose.returns(5);
            packet2.compose.returns(11);
            packet3.compose.returns(21);

            packet1.flush.returns(3);
            packet2.flush.returns(5);
            packet3.flush.returns(7);

            const createPacket = sandbox.stub(LzhCompressor.prototype, '_getPacket');
            createPacket
                .onCall(0).returns(packet1)
                .onCall(1).returns(packet2)
                .onCall(2).returns(packet3);

            const stubWriteCrc = sandbox.stub(LzhCompressor.prototype, '_writeCrc');
            stubWriteCrc.returns(100500);

            const source = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
            const target = Buffer.allocUnsafe(0);

            const dict = { prop: 'dict' } as any;
            sandbox.stub(LzhCompressor.prototype, '_getCompressionDict').returns(dict);

            const result = new LzhCompressor().writeCompressed(source, target, 10);
            expect(result).to.equal(100490);

            expect(createPacket.callCount).to.equal(3);
            expect(packet1.compose.calledWith(source, 0, dict)).to.equal(true);
            expect(packet2.compose.calledWith(source, 5, dict)).to.equal(true);
            expect(packet3.compose.calledWith(source, 16, dict)).to.equal(true);

            expect(packet1.flush.calledWith(target, 10)).to.equal(true);
            expect(packet2.flush.calledWith(target, 13)).to.equal(true);
            expect(packet3.flush.calledWith(target, 18)).to.equal(true);

            expect(stubWriteCrc.withArgs(source, target, 25).callCount).to.equal(1);
        });
    });

    describe('_writeCrc', () => {
        it('should write crc at offset', () => {
            const getCrc = sandbox.stub(LzhCompressor.prototype, '_getCrc');
            getCrc.returns(0x01020304);

            const source = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            const target = Buffer.alloc(6);
            const crc = new LzhCompressor()._writeCrc(source, target, 1);

            expect(crc).to.equal(5);
            expect(getCrc.withArgs(source).callCount).to.equal(1);
            expect(target).to.eql(Buffer.from([0x00, 0x04, 0x03, 0x02, 0x01, 0x00]));
        });
    });

    describe('_getCrc', () => {
        it('should return a summ of buffer elements', () => {
            const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            const crc = new LzhCompressor()._getCrc(buf);

            expect(crc).to.equal(55);
        });
    });

    describe('_getCompressionDict', () => {
        it('should create a new compression dict', () => {
            const compressor = new LzhCompressor();

            const dict1 = compressor._getCompressionDict();
            const dict2 = compressor._getCompressionDict();

            expect(dict1).to.be.instanceOf(StackBuffer);
            expect(dict2).to.be.instanceOf(StackBuffer);
            expect(dict1).not.to.equal(dict2);
        });
    });

    describe('_getPacket', () => {
        it('should create a new packet', () => {
            const compressor = new LzhCompressor();

            const packet1 = compressor._getPacket();
            const packet2 = compressor._getPacket();

            expect(packet1).to.be.instanceOf(LzhPacket);
            expect(packet2).to.be.instanceOf(LzhPacket);
            expect(packet1).not.to.equal(packet2);
        });
    });
});