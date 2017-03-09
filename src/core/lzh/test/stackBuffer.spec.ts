import { expect } from 'chai';
import { SequenceInspection, BufferIntersection, StackBuffer } from '../stackBuffer';

describe('core/lzh/stackBuffer', () => {

    describe('add', () => {
        let size: number;

        beforeEach(() => {
            size = StackBuffer.size;
            StackBuffer.size = 10;
        });

        afterEach(() => {
            StackBuffer.size = size;
        });

        it('should add a buffer longer than a space remaining', () => {
            const data1 = Buffer.from([0, 1, 2, 3, 4, 5, 6]);
            const data2 = Buffer.from([7, 8, 9, 10, 11]);

            const buf = new StackBuffer();
            buf.add(data1, 0, data1.length);
            buf.add(data2, 0, data2.length);

            const index = buf.intersect(Buffer.from([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));
            expect(index).to.eql({ length: 10, position: 0 } as BufferIntersection);
            expect(buf.fullfilment).to.equal(10);
        });

        it('should add a buffer not longer than a space remaining', () => {
            const data1 = Buffer.from([0, 1, 2, 3, 4, 5, 6]);
            const data2 = Buffer.from([7, 8, 9]);

            const buf = new StackBuffer();
            buf.add(data1, 0, data1.length);
            buf.add(data2, 0, data2.length);

            const index = buf.intersect(Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
            expect(index).to.eql({ length: 10, position: 0 } as BufferIntersection);
            expect(buf.fullfilment).to.equal(10);
        });
    });

    describe('intersect', () => {
        it('should return a negative result if buffer is empty', () => {
            const buf = new StackBuffer();
            const index = buf.intersect(Buffer.allocUnsafe(0));
            expect(index).to.eql({ length: 0, position: -1 } as BufferIntersection);
        });

        it('should return a negative result if stack is empty', () => {
            const buf = new StackBuffer();
            const index = buf.intersect(Buffer.allocUnsafe(10));
            expect(index).to.eql({ length: 0, position: -1 } as BufferIntersection);
        });

        it('should return a negative result if there were no intersections', () => {
            const data = Buffer.from([0, 0, 1, 1, 1, 1, 2, 2, 2, 2]);
            const buf = new StackBuffer();
            buf.add(data, 0, data.length);

            const index = buf.intersect(Buffer.from([3, 3, 3]));
            expect(index).to.eql({ length: 0, position: -1 } as BufferIntersection);
        });

        it('should return the most suitable intersection', () => {
            const data = Buffer.from([0, 0, 1, 1, 1, 1, 2, 2, 2, 2]);
            const buf = new StackBuffer();
            buf.add(data, 0, data.length);

            const index = buf.intersect(Buffer.from([1, 1, 2, 2, 2]));
            expect(index).to.eql({ length: 5, position: 4 } as BufferIntersection);
        });

        it('should return a partial intersection at the end of the data', () => {
            const data = Buffer.from([0, 0, 1, 1, 1, 1, 2, 2, 2, 3]);
            const buf = new StackBuffer();
            buf.add(data, 0, data.length);

            const index = buf.intersect(Buffer.from([2, 2, 3, 5, 1]));
            expect(index).to.eql({ length: 3, position: 7 } as BufferIntersection);
        });

        it('should return a partial intersection in the middle of the data', () => {
            const data = Buffer.from([1, 1, 1, 1, 2, 2, 2, 3, 0, 0]);
            const buf = new StackBuffer();
            buf.add(data, 0, data.length);

            const index = buf.intersect(Buffer.from([2, 2, 3, 5, 1]));
            expect(index).to.eql({ length: 3, position: 5 } as BufferIntersection);
        });
    });

    describe('checkWhitespace', () => {
        it('should return 0 if buffer starts from a non-whitespace', () => {
            const buf = new StackBuffer();
            const count = buf.checkWhitespace(Buffer.from([0x10]));
            expect(count).to.eql(0);
        });

        it('should return a count of sequantial whitespaces', () => {
            const buf = new StackBuffer();
            const count = buf.checkWhitespace(Buffer.from([0x20, 0x20, 0x20, 0x20, 0x20]));
            expect(count).to.eql(5);
        });

        it('should return a count of sequantial whitespaces ending with a non-whitespace', () => {
            const buf = new StackBuffer();
            const count = buf.checkWhitespace(Buffer.from([0x20, 0x20, 0x20, 0x20, 0x20, 0x00]));
            expect(count).to.eql(5);
        });
    });

    describe('checkSequence', () => {
        it('should return a valid result if there is no match at all', () => {
            const buf = new StackBuffer();
            buf.add(Buffer.from([0x00, 0x01, 0x02, 0x03]), 0, 4);

            const match = buf.checkSequence(Buffer.from([0x05, 0x06, 0x07]));

            expect(match).to.eql({ sequenceBytes: 0, sourceBytes: 0 } as SequenceInspection);
        });

        it('should return a valid result if there is a regular intersection', () => {
            const buf = new StackBuffer();
            buf.add(Buffer.from([0x00, 0x01, 0x02, 0x03]), 0, 4);

            const match = buf.checkSequence(Buffer.from([0x02, 0x03, 0x04]));

            expect(match).to.eql({ sequenceBytes: 2, sourceBytes: 2 } as SequenceInspection);
        });

        it('should return a valid result if there is a sequence intersection', () => {
            const buf = new StackBuffer();
            buf.add(Buffer.from([0x00, 0x01, 0x02, 0x03]), 0, 4);

            const match = buf.checkSequence(Buffer.from([0x02, 0x03, 0x02, 0x03, 0x02, 0x03, 0x02]));

            expect(match).to.eql({ sequenceBytes: 2, sourceBytes: 7 } as SequenceInspection);
        });
    });
});