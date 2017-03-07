import { expect } from 'chai';
import * as sinon from 'sinon';
import { LzhCompressor } from '../lzhCompressor';

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
});