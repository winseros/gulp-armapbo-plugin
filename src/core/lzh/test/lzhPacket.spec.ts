import { expect } from 'chai';
import * as sinon from 'sinon';
import { LzhPacket } from '../lzhPacket';

describe('core/lzh/lzhPacket', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('compose', () => {
        it('should fill the full packet', () => {
            const stubCompressed = sandbox.stub(LzhPacket.prototype, '_composeCompressed');
            const spyUncompressed = sandbox.spy(LzhPacket.prototype, '_composeUncompressed');

            stubCompressed.onCall(0).returns(1)
                .onCall(1).returns(3)
                .onCall(2).returns(5)
                .onCall(3).returns(7)
                .onCall(4).returns(9)
                .onCall(5).returns(11)
                .onCall(6).returns(13)
                .onCall(7).returns(15);//summ=64

            const source = Buffer.allocUnsafe(100);
            const dict = { prop: 'dict' } as any;
            const processed = new LzhPacket().compose(source, 10, dict);

            expect(processed).to.equal(64);

            expect(spyUncompressed.callCount).to.equal(0);
            expect(stubCompressed.callCount).to.equal(8);

            expect(stubCompressed.withArgs(1, 18, source, 10, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(2, 18, source, 11, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(3, 18, source, 14, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(4, 18, source, 19, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(5, 18, source, 26, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(6, 18, source, 35, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(7, 18, source, 46, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(8, 18, source, 59, dict).callCount).to.equal(1);
        });

        it('should fill the packet until the source has data', () => {
            const stubCompressed = sandbox.stub(LzhPacket.prototype, '_composeCompressed');
            const stubUncompressed = sandbox.stub(LzhPacket.prototype, '_composeUncompressed');

            stubCompressed.onCall(0).returns(1)
                .onCall(1).returns(3)
                .onCall(2).returns(5);
            stubUncompressed.returns(1);

            const source = Buffer.allocUnsafe(100);
            const dict = { prop: 'dict' } as any;
            const processed = new LzhPacket().compose(source, 90, dict);

            expect(processed).to.equal(10);

            expect(stubUncompressed.callCount).to.equal(1);
            expect(stubCompressed.callCount).to.equal(3);

            expect(stubCompressed.withArgs(1, 10, source, 90, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(2, 9, source, 91, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(3, 6, source, 94, dict).callCount).to.equal(1);

            expect(stubUncompressed.withArgs(4, source, 99, dict).callCount).to.equal(1);
        });
    });
});