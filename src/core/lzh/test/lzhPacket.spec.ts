import { expect } from 'chai';
import * as sinon from 'sinon';
import { LzhPacket } from '../lzhPacket';
import { BufferIntersection, SequenceInspection, StackBuffer } from '../stackBuffer';

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

            expect(stubCompressed.withArgs(0, 18, source, 10, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(1, 18, source, 11, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(2, 18, source, 14, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(3, 18, source, 19, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(4, 18, source, 26, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(5, 18, source, 35, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(6, 18, source, 46, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(7, 18, source, 59, dict).callCount).to.equal(1);
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

            expect(stubCompressed.withArgs(0, 10, source, 90, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(1, 9, source, 91, dict).callCount).to.equal(1);
            expect(stubCompressed.withArgs(2, 6, source, 94, dict).callCount).to.equal(1);

            expect(stubUncompressed.withArgs(3, source, 99, dict).callCount).to.equal(1);
        });
    });

    describe('_composeUncompressed', () => {
        it('should add a number to output buffer', () => {
            const source = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            const dict = { add: sandbox.spy() } as any;

            const packet = new LzhPacket();
            const processed = packet._composeUncompressed(7, source, 3, dict);

            expect(processed).to.equal(1);
            expect(dict.add.withArgs(source, 3, 1).callCount).to.equal(1);

            const target = Buffer.alloc(3);
            const written = packet.flush(target, 0);
            expect(written).to.equal(2);
            expect(target).to.eql(Buffer.from([0b10000000, 3, 0]));
        });
    });

    describe('_composeCompressed', () => {
        it('should fall back to _composeUncompressed if could not pick enough data to pack', () => {
            const dict = {
                intersect: sandbox.stub(),
                checkWhitespace: sandbox.stub(),
                checkSequence: sandbox.stub()
            } as any;

            dict.intersect.returns({ length: 2, position: 0 } as BufferIntersection);
            dict.checkWhitespace.returns(2);
            dict.checkSequence.returns({ sourceBytes: 2, sequenceBytes: 0 } as SequenceInspection);

            const stubUncompressed = sandbox.stub(LzhPacket.prototype, '_composeUncompressed');
            stubUncompressed.returns(100500);

            const source = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            const read = 3;
            const offset = 5;
            const processed = new LzhPacket()._composeCompressed(1, read, source, offset, dict);

            expect(processed).to.equal(100500);

            const subSource = Buffer.from(source.buffer, offset, read);
            expect(dict.intersect.withArgs(subSource).callCount).to.equal(1);
            expect(dict.checkWhitespace.withArgs(subSource).callCount).to.equal(1);
            expect(dict.checkSequence.withArgs(subSource).callCount).to.equal(1);

            expect(stubUncompressed.withArgs(1, source, offset, dict).callCount).to.equal(1);
        });

        it('should pack uning an intersection', () => {
            const dict = {
                add: sandbox.spy(),
                intersect: sandbox.stub(),
                checkWhitespace: sandbox.stub(),
                checkSequence: sandbox.stub(),
                fullfilment: 11
            } as any;

            const intersection = { length: 11, position: 1 } as BufferIntersection;
            dict.intersect.returns(intersection);
            dict.checkWhitespace.returns(2);
            dict.checkSequence.returns({ sourceBytes: 2, sequenceBytes: 0 } as SequenceInspection);

            const spyUncompressed = sandbox.spy(LzhPacket.prototype, '_composeUncompressed');
            const stubComposePointer = sandbox.stub(LzhPacket.prototype, '_composePointer').returns(0b1010101001010101);

            const offset = 5;
            const source = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            const packet = new LzhPacket();
            const processed = packet._composeCompressed(1, 3, source, offset, dict);

            expect(processed).to.equal(intersection.length);
            expect(spyUncompressed.callCount).to.equal(0);
            expect(stubComposePointer.withArgs(dict.fullfilment - intersection.position, intersection.length).callCount).to.equal(1);
            expect(dict.add.withArgs(source, offset, intersection.length).callCount).to.equal(1);

            const target = Buffer.alloc(4);
            const written = packet.flush(target, 0);
            expect(written).to.equal(3);
            expect(target).to.eql(Buffer.from([0, 0b01010101, 0b10101010, 0]));
        });

        it('should pack uning whitespaces', () => {
            const dict = {
                add: sandbox.spy(),
                intersect: sandbox.stub(),
                checkWhitespace: sandbox.stub(),
                checkSequence: sandbox.stub()
            } as any;

            const whitespaces = 10;
            dict.checkWhitespace.returns(whitespaces);
            dict.intersect.returns({ length: 2, position: 1 } as BufferIntersection);
            dict.checkSequence.returns({ sourceBytes: 2, sequenceBytes: 0 } as SequenceInspection);

            const spyUncompressed = sandbox.spy(LzhPacket.prototype, '_composeUncompressed');
            const stubComposePointer = sandbox.stub(LzhPacket.prototype, '_composePointer').returns(0b1010101001010101);

            const offset = 5;//less than max size
            const source = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            const packet = new LzhPacket();
            const processed = packet._composeCompressed(1, 3, source, offset, dict);

            expect(processed).to.equal(whitespaces);
            expect(spyUncompressed.callCount).to.equal(0);
            expect(stubComposePointer.withArgs(offset + whitespaces, whitespaces).callCount).to.equal(1);
            expect(dict.add.withArgs(source, offset, whitespaces).callCount).to.equal(1);

            const target = Buffer.alloc(4);
            const written = packet.flush(target, 0);
            expect(written).to.equal(3);
            expect(target).to.eql(Buffer.from([0, 0b01010101, 0b10101010, 0]));
        });

        it('should not pack uning whitespaces if offset is greater than stackbuffer size', () => {
            const dict = {
                add: sandbox.spy(),
                intersect: sandbox.stub(),
                checkWhitespace: sandbox.spy(),
                checkSequence: sandbox.stub(),
                fullfilment: 11
            } as any;

            const intersection = { length: 11, position: 1 } as BufferIntersection;
            dict.intersect.returns(intersection);
            dict.checkSequence.returns({ sourceBytes: 2, sequenceBytes: 0 } as SequenceInspection);

            sandbox.spy(LzhPacket.prototype, '_composeUncompressed');
            const stubComposePointer = sandbox.stub(LzhPacket.prototype, '_composePointer').returns(0b1010101001010101);

            const offset = LzhPacket.maxOffsetToUseWhitespaces;//equal to max size;
            const source = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            const packet = new LzhPacket();
            const processed = packet._composeCompressed(1, 3, source, offset, dict);

            expect(processed).to.equal(intersection.length);
            expect(stubComposePointer.withArgs(dict.fullfilment - intersection.position, intersection.length).callCount).to.equal(1);
            expect(dict.add.withArgs(source, offset, intersection.length).callCount).to.equal(1);

            expect(dict.checkWhitespace.callCount).to.equal(0);
        });

        it('should pack uning sequence', () => {
            const dict = {
                add: sandbox.spy(),
                intersect: sandbox.stub(),
                checkWhitespace: sandbox.stub(),
                checkSequence: sandbox.stub()
            } as any;

            const sequence = { sourceBytes: 10, sequenceBytes: 2 } as SequenceInspection;
            dict.checkSequence.returns(sequence);
            dict.intersect.returns({ length: 2, position: 1 } as BufferIntersection);
            dict.checkWhitespace.returns(2);

            const spyUncompressed = sandbox.spy(LzhPacket.prototype, '_composeUncompressed');
            const stubComposePointer = sandbox.stub(LzhPacket.prototype, '_composePointer').returns(0b1010101001010101);

            const offset = 5;
            const source = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            const packet = new LzhPacket();
            const processed = packet._composeCompressed(1, 3, source, offset, dict);

            expect(processed).to.equal(sequence.sourceBytes);
            expect(spyUncompressed.callCount).to.equal(0);
            expect(stubComposePointer.withArgs(StackBuffer.size - sequence.sequenceBytes, sequence.sourceBytes).callCount).to.equal(1);
            expect(dict.add.withArgs(source, offset, sequence.sourceBytes).callCount).to.equal(1);

            const target = Buffer.alloc(4);
            const written = packet.flush(target, 0);
            expect(written).to.equal(3);
            expect(target).to.eql(Buffer.from([0, 0b01010101, 0b10101010, 0]));
        });
    });

    describe('_composePointer', () => {
        it('should compose a valud pointer', () => {
            const pointer = new LzhPacket()._composePointer(0b011001011010, 0b1111 + LzhPacket.minBytesToPack);
            expect(pointer).to.equal(0b0110111101011010);
        });
    });
});