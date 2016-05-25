import {PboTransformStream} from '../pboTransformStream';
import {PboBuilder} from '../pboBuilder';
import * as stream from 'stream';
import {expect} from 'chai';
import * as sinon from 'sinon';
import {DummyStats} from './dummyStats';
import File = require('vinyl');

describe('core/pboTransformStream', function () {

	let sandbox:sinon.SinonSandbox;

	beforeEach(function () {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('_transform', function () {
		it('should throw if input is streamed', function (done) {
			let transform = new PboTransformStream('file.pbo').on('error', (err:Error)=> {
				expect(err).to.be.an('Error');
				expect(err.message).to.equal('Streaming input is not supported');
				done();
			});

			let emitter = new stream.Readable({objectMode: true});
			emitter._read = function () {
				let file = new File({contents: new stream.Duplex()});
				this.push(file);
				this.push(null);
			};
			emitter.pipe(transform);
		});

		it('should create a pbo file', function (done) {
			const contents = new Buffer('contents');
			let stubBuild = sandbox.stub(PboBuilder.prototype, 'build').returns(contents);

			const contents1 = new Buffer('some-buffer-contents-number-first');
			const file1 = new File({
				path: 'file1.txt',
				contents: contents1,
				stat: new DummyStats(contents1.length, new Date())
			});

			const contents2 = new Buffer('some-buffer-contents-number-second');
			const file2 = new File({
				path: 'file2.txt',
				contents: contents2,
				stat: new DummyStats(contents2.length, new Date())
			});

			let i = 0;
			let emitter = new stream.Readable({objectMode: true});
			emitter._read = function () {
				if (i == 0) {
					this.push(file1);
				} else if (i == 1) {
					this.push(file2);
				} else {
					this.push(null);
				}
				i++;
			};

			let receiver = new stream.Writable({objectMode: true});
			receiver._write = function (data:File, encoding:string, callback:Function):void {
				expect(data).not.to.equal(null);
				expect(data).not.to.equal(undefined);

				expect(data.basename).to.equal('a-pbo-file-name.pbo');
				expect(data.extname).to.equal('.pbo');
				expect(data.contents).to.equal(contents);

				expect(stubBuild.calledOnce).to.equal(true);
				expect(stubBuild.calledWith([file1, file2], [])).to.equal(true);

				done();

				callback();
			};

			emitter.pipe(new PboTransformStream('a-pbo-file-name.pbo')).pipe(receiver);
		});

		it('should create a pbo file with header extensions', function (done) {
			const contents = new Buffer('contents');
			let stubBuild = sandbox.stub(PboBuilder.prototype, 'build').returns(contents);

			let ext1 = {name: 'ext1n', value: 'ext1v'};
			let ext2 = {name: 'ext2n', value: 'ext2v'};

			let emitter = new stream.Readable({objectMode: true});
			emitter._read = function () {
				this.push(null);
			};

			let receiver = new stream.Writable({objectMode: true});
			receiver._write = function (data:File, encoding:string, callback:Function):void {
				expect(stubBuild.calledOnce).to.equal(true);
				expect(stubBuild.calledWith([], [ext1, ext2])).to.equal(true);

				done();
				callback();
			};

			emitter.pipe(new PboTransformStream('a-pbo-file-name.pbo', [ext1, ext2])).pipe(receiver);
		});
	});
});