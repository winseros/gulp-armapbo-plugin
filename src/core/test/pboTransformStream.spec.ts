import {PboTransformStream} from '../pboTransformStream';
import {PboBuilder} from '../pboBuilder';
import {Readable, Writable, Duplex} from 'stream';
import {expect} from 'chai';
import * as sinon from 'sinon';
import {DummyStats} from './dummyStats';
import * as File from 'vinyl';

class MockReadable extends Readable {
	constructor() {
		super({ objectMode: true });
	}

	mockRead(impl: (size?: number) => void): void {
		this._read = impl;
	}
}

class MockWritable extends Writable {
	constructor() {
		super({ objectMode: true });
	}

	mockWrite(impl: (data: File, encoding: string, callback: Function) => void): void {
		this._write = impl;
	}
}

describe('core/pboTransformStream', function() {
	let sandbox: sinon.SinonSandbox;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('_transform', function() {
		it('should throw if input is streamed', function(done) {
			const transform = new PboTransformStream('file.pbo').on('error', (err: Error) => {
				expect(err).to.be.an('Error');
				expect(err.message).to.equal('Streaming input is not supported');
				done();
			});

			const emitter = new MockReadable();
			emitter.mockRead(() => {
				let file = new File({ contents: new Duplex() });
				emitter.push(file);
				emitter.push(null);
			});

			emitter.pipe(transform);
		});

		it('should create a pbo file', function(done) {
			const contents = new Buffer('contents');
			let stubBuild = sandbox.stub(PboBuilder.prototype, 'build').returns(contents);

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
			const emitter = new MockReadable();
			emitter.mockRead(() => {
				if (i === 0) {
					emitter.push(file1);
				} else if (i === 1) {
					emitter.push(file2);
				} else {
					emitter.push(null);
				}
				i++;
			});

			const reciever = new MockWritable();
			reciever.mockWrite((data: File, encoding: string, callback: Function) => {
				expect(data).not.to.equal(null);
				expect(data).not.to.equal(undefined);

				expect(data.basename).to.equal('a-pbo-file-name.pbo');
				expect(data.extname).to.equal('.pbo');
				expect(data.contents).to.equal(contents);

				expect(stubBuild.calledOnce).to.equal(true);
				expect(stubBuild.calledWith([file1, file2], [])).to.equal(true);

				done();

				callback();
			});

			emitter.pipe(new PboTransformStream('a-pbo-file-name.pbo')).pipe(reciever);
		});

		it('should create a pbo file with header extensions', function(done) {
			const contents = new Buffer('contents');
			let stubBuild = sandbox.stub(PboBuilder.prototype, 'build').returns(contents);

			let ext1 = { name: 'ext1n', value: 'ext1v' };
			let ext2 = { name: 'ext2n', value: 'ext2v' };

			const emitter = new MockReadable();
			emitter.mockRead(() => {
				emitter.push(null);
			});

			const reciever = new MockWritable();
			reciever.mockWrite((data: File, encoding: string, callback: Function) => {
				expect(stubBuild.calledOnce).to.equal(true);
				expect(stubBuild.calledWith([], [ext1, ext2])).to.equal(true);

				done();
				callback();
			});

			const options = { headerExtensions: [ext1, ext2] };
			emitter.pipe(new PboTransformStream('a-pbo-file-name.pbo', options)).pipe(reciever);
		});
	});
});
