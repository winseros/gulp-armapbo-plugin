import { PboTransformStream } from '../pboTransformStream2';
import { PboBuilder } from '../pboBuilder2';
import { StreamOptions } from '../streamOptions';
import { Readable, Writable, Duplex } from 'stream';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as File from 'vinyl';
import * as path from 'path';

describe('core/pboTransformStream', function () {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
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
                stat: { mtime: new Date() } as any
            });

            const contents2 = new Buffer('some-buffer-contents-number-second');
            const file2 = new File({
                path: 'file2.txt',
                contents: contents2,
                stat: { mtime: new Date() } as any
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

            let options: StreamOptions;

            const reciever = new Writable({
                objectMode: true,
                write: (data: any, enc: string, cb: Function) => {
                    expect(data).not.to.equal(null);
                    expect(data).not.to.equal(undefined);

                    expect(data.basename).to.equal('a-pbo-file-name.pbo');
                    expect(data.extname).to.equal('.pbo');
                    expect(data.contents).to.equal(contents);

                    expect(stubBuild.callCount).to.equal(1);
                    expect(stubBuild.calledWith([file1, file2], options)).to.equal(true);

                    done();
                    cb();
                }
            });

            options = { fileName: 'a-pbo-file-name.pbo' };
            emitter.pipe(new PboTransformStream(options)).pipe(reciever);
        });

        it('should create a pbo file with default name', (done: Function) => {
            const contents = new Buffer('contents');
            const stubBuild = sandbox.stub(PboBuilder.prototype, 'build').returns(contents);

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

                    const segments = process.cwd().split(path.sep);
                    expect(data.basename).to.equal(`${segments[segments.length - 1]}.pbo`);
                    expect(data.extname).to.equal('.pbo');
                    expect(data.contents).to.equal(contents);

                    callback();
                    done();
                }
            });

            emitter.pipe(new PboTransformStream()).pipe(reciever);
        });
    });
});