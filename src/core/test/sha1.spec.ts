import { Sha1 } from '../sha1';
import { expect } from 'chai';

describe('core/sha1', () => {
    describe('ctor', () => {
        it('should throw if called with illegal args', () => {
            expect(() => new Sha1(null as any)).to.throw(/buffer/);
        });
    });

    describe('get', () => {
        it('should return a buffer with checksum', () => {
            const str = 'some-string-to-get-checksum-of';
            const buf = new Buffer(str);

            const sha = new Sha1(buf);
            const checksum = sha.get();

            expect(checksum).not.to.equal(null);
            expect(checksum).not.to.equal(undefined);
            expect(checksum.length).to.equal(20);

            const expected = new Buffer([0x81, 0x56, 0x91, 0xb2, 0x0b, 0x6a, 0x11, 0x37, 0x43, 0x84, 0xae, 0x42, 0x7c, 0x00, 0x18, 0xeb, 0xf7, 0x25, 0x51, 0x87]);
            expect(checksum).to.eql(expected);
        });
    });
});