import { PboFormatter } from '../pboFormatter';
import { PackingMethod } from '../../domain/packingMethod';
import { HeaderExtension } from '../../domain/headerExtension';
import { HeaderEntry } from '../../domain/headerEntry';
import { Header } from '../../domain/header';
import { expect } from 'chai';

describe('core/pboFormatter', () => {
    describe('build', () => {
        it('should build an uncompressed pbo', () => {
            const timestamp1 = new Date('2014-05-15T00:00:00+0300').getTime() / 1000;
            const contents1 = new Buffer('some-buffer-contents-number-first');
            const timestamp2 = new Date('2014-05-20T00:00:00+0300').getTime() / 1000;
            const contents2 = new Buffer('some-buffer-contents-number-second');

            const extension1 = new HeaderExtension('first-extension-name', 'first-extension-value');
            const extension2 = new HeaderExtension('second-extension-name', 'second-extension-value');

            const entry1 = new HeaderEntry('file1.txt', PackingMethod.uncompressed, contents1.length, timestamp1);
            const entry2 = new HeaderEntry('file2.txt', PackingMethod.uncompressed, contents2.length, timestamp2);
            entry1.dataSize = contents1.length;
            entry2.dataSize = contents2.length;
            entry1.contents = contents1;
            entry2.contents = contents2;

            const buffer = new PboFormatter().format(new Header([extension1, extension2], [entry1, entry2]));

            const expected = new Buffer([0, 115, 114, 101, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,//signature
                102, 105, 114, 115, 116, 45, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 110, 97, 109, 101, 0, 102, 105, 114, 115, 116, 45, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 118, 97, 108, 117, 101, 0,//ext1
                115, 101, 99, 111, 110, 100, 45, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 110, 97, 109, 101, 0, 115, 101, 99, 111, 110, 100, 45, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 118, 97, 108, 117, 101, 0,//ext2
                0,//zero
                102, 105, 108, 101, 49, 46, 116, 120, 116, 0, 0, 0, 0, 0, 33, 0, 0, 0, 0, 0, 0, 0, 80, 217, 115, 83, 33, 0, 0, 0,//file1.txt
                102, 105, 108, 101, 50, 46, 116, 120, 116, 0, 0, 0, 0, 0, 34, 0, 0, 0, 0, 0, 0, 0, 208, 112, 122, 83, 34, 0, 0, 0,//file2.txt
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, //boundary
                115, 111, 109, 101, 45, 98, 117, 102, 102, 101, 114, 45, 99, 111, 110, 116, 101, 110, 116, 115, 45, 110, 117, 109, 98, 101, 114, 45, 102, 105, 114, 115, 116,
                115, 111, 109, 101, 45, 98, 117, 102, 102, 101, 114, 45, 99, 111, 110, 116, 101, 110, 116, 115, 45, 110, 117, 109, 98, 101, 114, 45, 115, 101, 99, 111, 110, 100,
                0,//zero
                74, 246, 111, 61, 67, 189, 91, 87, 60, 204, 73, 38, 246, 189, 139, 211, 147, 222, 140, 238]);//checksum

            expect(buffer).to.eql(expected);
        });
    });
});