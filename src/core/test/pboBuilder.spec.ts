import {PboBuilder} from '../pboBuilder';
import {PboHeaderExtension} from '../../domain/pboHeaderExtension';
import {DummyStats} from './dummyStats';
import {expect} from 'chai';
import * as File from 'vinyl';

describe('core/pboBuilder', function() {
	describe('build', function() {
		it('should throw if called with illegal args', function() {
			const builder = new PboBuilder();

			expect(function() {
				builder.build(null, null);
			}).to.throw(/contents/);

			expect(function() {
				builder.build([], null);
			}).to.throw(/headerExt/);
		});

		it('should build a valid pbo', function() {
			const contents1 = new Buffer('some-buffer-contents-number-first');
			const file1 = new File({
				path: 'file1.txt',
				contents: contents1,
				stat: new DummyStats(new Date(2014, 4, 15))
			});

			const contents2 = new Buffer('some-buffer-contents-number-second');
			const file2 = new File({
				path: 'file2.txt',
				contents: contents2,
				stat: new DummyStats(new Date(2014, 4, 20))
			});

			const extension1 = new PboHeaderExtension('first-extension-name', 'first-extension-value');
			const extension2 = new PboHeaderExtension('second-extension-name', 'second-extension-value');

			const builder = new PboBuilder();
			const buffer = builder.build([file1, file2], [extension1, extension2]);

			expect(buffer).not.to.equal(null);
			expect(buffer).not.to.equal(undefined);

			expect(buffer.length).to.equal(279);

			const expected = new Buffer([0, 115, 114, 101, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 102,
				105, 114, 115, 116, 45, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 110, 97, 109, 101, 0, 102,
				105, 114, 115, 116, 45, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 118, 97, 108, 117, 101, 0,
				115, 101, 99, 111, 110, 100, 45, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 110, 97, 109, 101,
				0, 115, 101, 99, 111, 110, 100, 45, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 118, 97, 108,
				117, 101, 0, 0, 102, 105, 108, 101, 49, 46, 116, 120, 116, 0, 0, 0, 0, 0, 33, 0, 0, 0, 0, 0, 0, 0,
				80, 217, 115, 83, 33, 0, 0, 0, 102, 105, 108, 101, 50, 46, 116, 120, 116, 0, 0, 0, 0, 0, 34, 0, 0,
				0, 0, 0, 0, 0, 208, 112, 122, 83, 34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 115, 111, 109, 101, 45, 98, 117, 102, 102, 101, 114, 45, 99, 111, 110, 116, 101, 110, 116,
				115, 45, 110, 117, 109, 98, 101, 114, 45, 102, 105, 114, 115, 116, 115, 111, 109, 101, 45, 98, 117,
				102, 102, 101, 114, 45, 99, 111, 110, 116, 101, 110, 116, 115, 45, 110, 117, 109, 98, 101, 114, 45,
				115, 101, 99, 111, 110, 100, 0, 74, 246, 111, 61, 67, 189, 91, 87, 60, 204, 73, 38, 246, 189, 139,
				211, 147, 222, 140, 238]);

			expect(buffer).to.eql(expected);
		});
	});
});
