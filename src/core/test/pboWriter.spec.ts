import {PboWriter} from '../pboWriter';
import {PboHeaderEntry, PackingMethod} from '../../domain/pboHeaderEntry';
import {PboHeaderExtension} from '../../domain/pboHeaderExtension';
import {expect} from 'chai';

describe('core/pboWriter', function () {
	describe('writeHeaderEntry', function () {
		it('should inflate buffer with entry data', function () {
			const entry = new PboHeaderEntry('entry-file-name', PackingMethod.packed, 100, new Date(2014, 4, 15).getTime() / 1000, 120);

			const writer = new PboWriter();

			let buffer = new Buffer(entry.getSize());
			const offset = writer.writeHeaderEntry(buffer, entry, 0);

			expect(offset).to.equal(buffer.length);

			const expected = new Buffer([101, 110, 116, 114, 121, 45, 102, 105, 108, 101, 45, 110, 97, 109, 101, 0, 115, 114, 112, 67, 100, 0, 0, 0, 0, 0, 0, 0, 80, 217, 115, 83, 120, 0, 0, 0]);
			expect(buffer).to.eql(expected);
		});
	});

	describe('writeHeaderExtension', function () {
		it('should inflate buffer with extension data', function () {
			const extension = new PboHeaderExtension("extension-name", "extension-value");

			const writer = new PboWriter();

			let buffer = new Buffer(extension.getSize());
			const offset = writer.writeHeaderExtension(buffer, extension, 0);

			expect(offset).to.equal(buffer.length);

			const expected = new Buffer([101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 110, 97, 109, 101, 0, 101, 120, 116, 101, 110, 115, 105, 111, 110, 45, 118, 97, 108, 117, 101, 0]);
			expect(buffer).to.eql(expected);
		});
	});
});