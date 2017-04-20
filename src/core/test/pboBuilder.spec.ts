import { PboBuilder } from '../pboBuilder';
import { PboFormatter } from '../pboFormatter';
import { StreamOptions } from '../streamOptions';
import { Header } from '../../domain/header';
import { HeaderExtension } from '../../domain/headerExtension';
import { HeaderEntry } from '../../domain/headerEntry';
import { PackingMethod } from '../../domain/packingMethod';
import { PackingFuncFactory } from '../packingFuncFactory';
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

            //files
            const contents1 = Buffer.allocUnsafe(10);
            const file1 = new File({ path: 'file1.txt', contents: contents1, stat: { mtime: new Date('2015-05-15T00:00:00+0000') } as any });
            const contents2 = Buffer.allocUnsafe(15);
            const file2 = new File({ path: 'file2.txt', contents: contents2, stat: { mtime: new Date('2015-05-20T00:00:00+0000') } as any });

            //packing method function
            const stubPackingFunc = sandbox.stub();
            stubPackingFunc
                .onCall(0).returns(PackingMethod.uncompressed)
                .onCall(1).returns(PackingMethod.packed);
            const stubPackingFactory = sandbox.stub(PackingFuncFactory, 'getPackingFunc');
            stubPackingFactory.returns(stubPackingFunc);

            //internal services
            const result = Buffer.allocUnsafe(20);
            const stubFormat = sandbox.stub(PboFormatter.prototype, 'format').returns(result);

            //call the method
            const data = new PboBuilder().build([file1, file2], options);
            expect(data).to.equal(result);

            //check packing method function calls
            expect(stubPackingFactory.withArgs(options).callCount).to.equal(1);
            expect(stubPackingFunc.withArgs(file2).callCount).to.equal(1);
            expect(stubPackingFunc.withArgs(file1).callCount).to.equal(1);

            //header
            expect(stubFormat.callCount).to.equal(1);
            expect(stubFormat.args[0][1]).to.equal(options);

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
            expect(header.entries[1].packingMethod).to.equal(PackingMethod.packed);
            expect(header.entries[1].originalSize).to.equal(contents2.length);
            expect(header.entries[1].dataSize).to.equal(contents2.length);
            expect(header.entries[1].contents).to.equal(contents2);
            expect(header.entries[1].timestamp).to.equal(file2.stat.mtime.getTime() / 1000);
        });

        it('should sort entries by packing method', () => {
            const options = {
                compress: '*.sqf'
            } as StreamOptions;

            //entries
            const contents = Buffer.allocUnsafe(10);
            const file1 = new File({ path: 'file1.sqf', contents: contents, stat: { mtime: new Date('2015-05-15T00:00:00+0000') } as any });
            const file2 = new File({ path: 'file2.txt', contents: contents, stat: { mtime: new Date('2015-05-20T00:00:00+0000') } as any });
            const file3 = new File({ path: 'file3.sqf', contents: contents, stat: { mtime: new Date('2015-05-25T00:00:00+0000') } as any });
            const file4 = new File({ path: 'file4.txt', contents: contents, stat: { mtime: new Date('2015-05-25T00:00:00+0000') } as any });
            const file5 = new File({ path: 'file5.sqf', contents: Buffer.allocUnsafe(0), stat: { mtime: new Date('2015-05-25T00:00:00+0000') } as any });//0-length contents

            //packing method function
            const stubPackingFunc = sandbox.stub();
            stubPackingFunc
                .onCall(0).returns(PackingMethod.packed)
                .onCall(1).returns(PackingMethod.uncompressed)
                .onCall(2).returns(PackingMethod.packed)
                .onCall(3).returns(PackingMethod.uncompressed)
                .onCall(4).returns(PackingMethod.uncompressed);
            const stubPackingFactory = sandbox.stub(PackingFuncFactory, 'getPackingFunc');
            stubPackingFactory.returns(stubPackingFunc);

            //internal services
            const result = Buffer.allocUnsafe(20);
            const stubFormat = sandbox.stub(PboFormatter.prototype, 'format').returns(result);

            //call the method
            const data = new PboBuilder().build([file1, file2, file3, file4, file5], options);
            expect(data).to.equal(result);

            //stubPackingFunc assert
            expect(stubPackingFunc.callCount).to.equal(5);
            expect(stubPackingFunc.args[0][0]).to.equal(file1);
            expect(stubPackingFunc.args[1][0]).to.equal(file2);
            expect(stubPackingFunc.args[2][0]).to.equal(file3);
            expect(stubPackingFunc.args[3][0]).to.equal(file4);
            expect(stubPackingFunc.args[4][0]).to.equal(file5);

            //entries assert
            const header = stubFormat.args[0][0] as Header;
            expect(header.entries.length).to.equal(5);
            expect(header.entries[0].name).to.equal('file2.txt');
            expect(header.entries[0].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[1].name).to.equal('file4.txt');
            expect(header.entries[1].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[2].name).to.equal('file5.sqf');
            expect(header.entries[2].packingMethod).to.equal(PackingMethod.uncompressed);
            expect(header.entries[3].name).to.equal('file1.sqf');
            expect(header.entries[3].packingMethod).to.equal(PackingMethod.packed);
            expect(header.entries[4].name).to.equal('file3.sqf');
            expect(header.entries[4].packingMethod).to.equal(PackingMethod.packed);
        });

        it('should filter out entries with empty contents', () => {
            //entries
            const contents1 = Buffer.allocUnsafe(10);
            const contents2: Buffer | null = null;
            const file1 = new File({ path: 'file1.sqf', contents: contents1, stat: { mtime: new Date('2015-05-15T00:00:00+0000') } as any });
            const file2 = new File({ path: 'file2.txt', contents: contents2!, stat: { mtime: new Date('2015-05-20T00:00:00+0000') } as any });

            //packing method function
            const stubPackingFunc = sandbox.stub();
            stubPackingFunc.onCall(0).returns(PackingMethod.uncompressed);
            const stubPackingFactory = sandbox.stub(PackingFuncFactory, 'getPackingFunc');
            stubPackingFactory.returns(stubPackingFunc);

            //internal services
            const result = Buffer.allocUnsafe(20);
            const stubFormat = sandbox.stub(PboFormatter.prototype, 'format').returns(result);

            //call the method
            const data = new PboBuilder().build([file1, file2], {});
            expect(data).to.equal(result);

            //stubPackingFunc assert
            expect(stubPackingFunc.callCount).to.equal(1);
            expect(stubPackingFunc.args[0][0]).to.equal(file1);

            //entries assert
            const header = stubFormat.args[0][0] as Header;
            expect(header.entries.length).to.equal(1);
            expect(header.entries[0].name).to.equal('file1.sqf');
            expect(header.entries[0].packingMethod).to.equal(PackingMethod.uncompressed);
        });
    });
});