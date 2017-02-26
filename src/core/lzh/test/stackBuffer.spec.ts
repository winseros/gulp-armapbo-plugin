import { expect } from 'chai';
import { BufferIntersection, StackBuffer } from '../stackBuffer';

describe('core/lzh/stackBuffer', () => {
    let size: number;
    beforeEach(() => {
        size = StackBuffer.size;
        StackBuffer.size = 10;
    });

    afterEach(() => {
        StackBuffer.size = size;
    });

    describe('add', () => {
        it('should add a buffer exceeding the stackBuffer size', () => {
            const data = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
            const buf = new StackBuffer();
            buf.add(data, 0, data.length);

            const index = buf.intersect(Buffer.from([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));
            expect(index).to.eql({ length: 10, position: 0 } as BufferIntersection);
            expect(buf.isFull).to.equal(true);
        });

        it('should add a buffer longer than a space remaining', () => {
            const data1 = Buffer.from([0, 1, 2, 3, 4, 5, 6]);
            const data2 = Buffer.from([7, 8, 9, 10, 11]);

            const buf = new StackBuffer();
            buf.add(data1, 0, data1.length);
            buf.add(data2, 0, data2.length);

            const index = buf.intersect(Buffer.from([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));
            expect(index).to.eql({ length: 10, position: 0 } as BufferIntersection);
            expect(buf.isFull).to.equal(true);
        });

        it('should add a buffer not longer than a space remaining', () => {
            const data1 = Buffer.from([0, 1, 2, 3, 4, 5, 6]);
            const data2 = Buffer.from([7, 8, 9]);

            const buf = new StackBuffer();
            buf.add(data1, 0, data1.length);
            buf.add(data2, 0, data2.length);

            const index = buf.intersect(Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
            expect(index).to.eql({ length: 10, position: 0 } as BufferIntersection);
            expect(buf.isFull).to.equal(true);
        });
    });

    describe('intersect', () => {
        it('should return a negative result if buffer is empty', () => {
            const buf = new StackBuffer();
            const index = buf.intersect(Buffer.allocUnsafe(0));
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
});