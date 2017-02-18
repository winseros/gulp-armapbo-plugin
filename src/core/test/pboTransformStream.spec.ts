import { PboTransformStream } from '../pboTransformStream';
import { PboBuilder } from '../pboBuilder';
import { PboHeaderExtension } from '../../domain/pboHeaderExtension';
import { StreamOptions } from '../streamOptions';
import { Readable, Writable, Duplex } from 'stream';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { DummyStats } from './dummyStats';
import * as File from 'vinyl';

describe('core/pboTransformStream', function () {
    let sandbox: sinon.SinonSandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('_transform', function () {
        it('should throw if input is streamed', (done: Function) => {
            const transform = new PboTransformStream().on('error', (err: Error) => {
                expect(err).to.be.an('Error');
                expect(err.message).to.equal('Streaming input is not supported');
                done();
            });

            const emitter = new Readable({
                objectMode: true,
                read: () => {
                    const file = new File({ contents: new Duplex() });
                    emitter.push(file);
                    emitter.push(null);
                }
            });

            emitter.pipe(transform);
        });

        it('should create a pbo file', (done: Function) => {
            const contents = new Buffer('contents');
            const stubBuild = sandbox.stub(PboBuilder.prototype, 'build').returns(contents);

            const contents1 = new Buffer('some-buffer-contents-number-first');
            const file1 = new File({
                path: 'file1.txt',
                contents: contents1,
                stat: new DummyStats(new Date())
            });

            const contents2 = new Buffer('some-buffer-contents-number-second');
            const file2 = new File({
                path: 'file2.txt',
                contents: contents2,
                stat: new DummyStats(new Date())
            });

            let i = 0;
            const emitter = new Readable({
                objectMode: true,
                read: () => {
                    if (i === 0) {
                        emitter.push(file1);
                    } else if (i === 1) {
                        emitter.push(file2);
                    } else {
                        emitter.push(null);
                    }
                    i++;
                }
            });

            const reciever = new Writable({
                objectMode: true,
                write: (data: any, enc: string, cb: Function) => {
                    expect(data).not.to.equal(null);
                    expect(data).not.to.equal(undefined);

                    expect(data.basename).to.equal('a-pbo-file-name.pbo');
                    expect(data.extname).to.equal('.pbo');
                    expect(data.contents).to.equal(contents);

                    expect(stubBuild.callCount).to.equal(1);
                    expect(stubBuild.calledWith([file1, file2], [])).to.equal(true);

                    done();
                    cb();
                }
            });

            emitter.pipe(new PboTransformStream({ fileName: 'a-pbo-file-name.pbo' })).pipe(reciever);
        });

        it('should create a pbo file with header extensions', (done: Function) => {
            const contents = new Buffer('contents');
            const stubBuild = sandbox.stub(PboBuilder.prototype, 'build').returns(contents);

            const ext1 = { name: 'ext1n', value: 'ext1v' };
            const ext2 = { name: 'ext2n', value: 'ext2v' };

            const emitter = new Readable({
                objectMode: true,
                read: () => {
                    emitter.push(null);
                }
            });

            const reciever = new Writable({
                objectMode: true,
                write: (data: any, enc: string, callback: Function) => {
                    expect(stubBuild.calledOnce).to.equal(true);

                    const args = stubBuild.args[0];
                    expect(args.length).to.equal(2);
                    expect(args[0]).to.eql([]);

                    const extensions = args[1] as PboHeaderExtension[];
                    expect(extensions.length).to.equal(2);
                    expect(extensions[0]).to.be.instanceOf(PboHeaderExtension);
                    expect(extensions[0].name).to.equal('ext1n');
                    expect(extensions[0].value).to.equal('ext1v');
                    expect(extensions[1]).to.be.instanceOf(PboHeaderExtension);
                    expect(extensions[1].name).to.equal('ext2n');
                    expect(extensions[1].value).to.equal('ext2v');

                    callback();
                    done();
                }
            });

            const options = {
                fileName: 'a-pbo-file-name.pbo',
                extensions: [ext1, ext2]
            } as StreamOptions;

            emitter.pipe(new PboTransformStream(options)).pipe(reciever);
        });
    });
});