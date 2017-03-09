import { PboBuilder } from '../pboBuilder';
import { PboFormatter } from '../pboFormatter';
import { StreamOptions } from '../streamOptions';
import { Header } from '../../domain/header';
import { HeaderExtension } from '../../domain/headerExtension';
import { HeaderEntry } from '../../domain/headerEntry';
import { PackingMethod } from '../../domain/packingMethod';
import * as File from 'vinyl';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('core/pboBuilder', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('build', () => {
        it('should handle options.extensions and call the inner services', () => {
            const options = {
                extensions: [
                    { name: 'ext1n', value: 'ext1v' },
                    { name: 'ext2n', value: 'ext2v' }
                ]
            } as StreamOptions;

            const contents1 = Buffer.allocUnsafe(10);
            const file1 = new File({ path: 'file1.txt', contents: contents1, stat: { mtime: new Date('2015-05-15T00:00:00+0000') } as any });
            const contents2 = Buffer.allocUnsafe(15);
            const file2 = new File({ path: 'file2.txt', contents: contents2, stat: { mtime: new Date('2015-05-20T00:00:00+0000') } as any });

            const result = Buffer.allocUnsafe(20);
            const stubFormat = sandbox.stub(PboFormatter.prototype, 'format').returns(result);

            const data = new PboBuilder().build([file1, file2], options);
            expect(data).to.equal(result);

            //header
            expect(stubFormat.callCount).to.equal(1);
            const header = stubFormat.args[0][0] as Header;
            expect(header).to.be.instanceof(Header);

            //extensions
            expect(header.extensions.length).to.equal(2);
            expect(header.extensions[0]).to.be.instanceof(HeaderExtension);
            expect(header.extensions[0].name).to.equal('ext1n');
            expect(header.extensions[0].value).to.equal('ext1v');
            expect(header.extensions[1]).to.be.instanceof(HeaderExtension);
            expect(header.extensions[1].name).to.equal('ext2n');
            expect(header.extensions[1].value).to.equal('ext2v');

            //entries
            expect(header.entries.length).to.equal(2);

            //entry1
            expect(header.entries[0]).to.be.instanceof(HeaderEntry);
            expect(header.entries[0].name).to.equal('file1.txt');
            expect(header.entries[0].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[0].originalSize).to.equal(contents1.length);
            expect(header.entries[0].dataSize).to.equal(contents1.length);
            expect(header.entries[0].contents).to.equal(contents1);
            expect(header.entries[0].timestamp).to.equal(file1.stat.mtime.getTime() / 1000);

            //entry2
            expect(header.entries[1]).to.be.instanceof(HeaderEntry);
            expect(header.entries[1].name).to.equal('file2.txt');
            expect(header.entries[1].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[1].originalSize).to.equal(contents2.length);
            expect(header.entries[1].dataSize).to.equal(contents2.length);
            expect(header.entries[1].contents).to.equal(contents2);
            expect(header.entries[1].timestamp).to.equal(file2.stat.mtime.getTime() / 1000);
        });

        it('should handle options.compress as a string', () => {
            const options = {
                compress: '*.sqf'
            } as StreamOptions;

            const contents = Buffer.allocUnsafe(10);
            const file1 = new File({ path: 'file1.sqf', contents: contents, stat: { mtime: new Date('2015-05-15T00:00:00+0000') } as any });
            const file2 = new File({ path: 'file2.txt', contents: contents, stat: { mtime: new Date('2015-05-20T00:00:00+0000') } as any });
            const file3 = new File({ path: 'file3.sqf', contents: contents, stat: { mtime: new Date('2015-05-25T00:00:00+0000') } as any });
            const file4 = new File({ path: 'file4.txt', contents: contents, stat: { mtime: new Date('2015-05-25T00:00:00+0000') } as any });

            const result = Buffer.allocUnsafe(20);
            const stubFormat = sandbox.stub(PboFormatter.prototype, 'format').returns(result);

            const data = new PboBuilder().build([file2, file1, file3, file4], options);
            expect(data).to.equal(result);

            const header = stubFormat.args[0][0] as Header;

            //entries
            expect(header.entries.length).to.equal(4);
            expect(header.entries[0].name).to.equal('file2.txt');
            expect(header.entries[0].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[1].name).to.equal('file4.txt');
            expect(header.entries[1].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[2].name).to.equal('file1.sqf');
            expect(header.entries[2].packingMethod).to.equal(PackingMethod.packed);
            expect(header.entries[3].name).to.equal('file3.sqf');
            expect(header.entries[3].packingMethod).to.equal(PackingMethod.packed);
        });

        it('should handle options.compress as an array', () => {
            const options = {
                compress: ['*.sqf', '*.ext']
            } as StreamOptions;

            const contents = Buffer.allocUnsafe(10);
            const file1 = new File({ path: 'file1.sqf', contents: contents, stat: { mtime: new Date('2015-05-15T00:00:00+0000') } as any });
            const file2 = new File({ path: 'file2.txt', contents: contents, stat: { mtime: new Date('2015-05-20T00:00:00+0000') } as any });
            const file3 = new File({ path: 'file3.ext', contents: contents, stat: { mtime: new Date('2015-05-25T00:00:00+0000') } as any });

            const result = Buffer.allocUnsafe(20);
            const stubFormat = sandbox.stub(PboFormatter.prototype, 'format').returns(result);

            const data = new PboBuilder().build([file1, file2, file3], options);
            expect(data).to.equal(result);

            const header = stubFormat.args[0][0] as Header;

            //entries
            expect(header.entries.length).to.equal(3);
            expect(header.entries[0].name).to.equal('file2.txt');
            expect(header.entries[0].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[1].name).to.equal('file1.sqf');
            expect(header.entries[1].packingMethod).to.equal(PackingMethod.packed);
            expect(header.entries[2].name).to.equal('file3.ext');
            expect(header.entries[2].packingMethod).to.equal(PackingMethod.packed);
        });

        it('should filter out non-string options.compress values', () => {
            const options = {
                compress: [123 as any]
            } as StreamOptions;

            const contents = Buffer.allocUnsafe(10);
            const file1 = new File({ path: 'file1.sqf', contents: contents, stat: { mtime: new Date('2015-05-15T00:00:00+0000') } as any });
            const file2 = new File({ path: 'file2.txt', contents: contents, stat: { mtime: new Date('2015-05-20T00:00:00+0000') } as any });
            const file3 = new File({ path: 'file3.ext', contents: contents, stat: { mtime: new Date('2015-05-25T00:00:00+0000') } as any });

            const result = Buffer.allocUnsafe(20);
            const stubFormat = sandbox.stub(PboFormatter.prototype, 'format').returns(result);

            const data = new PboBuilder().build([file1, file2, file3], options);
            expect(data).to.equal(result);

            const header = stubFormat.args[0][0] as Header;

            //entries
            expect(header.entries.length).to.equal(3);
            expect(header.entries[0].name).to.equal('file1.sqf');
            expect(header.entries[0].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[1].name).to.equal('file2.txt');
            expect(header.entries[1].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[2].name).to.equal('file3.ext');
            expect(header.entries[2].packingMethod).to.equal(PackingMethod.uncompressed);
        });
    });
});