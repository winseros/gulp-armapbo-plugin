import {PboHeaderEntry, PackingMethod} from '../pboHeaderEntry';
import {expect} from 'chai';

describe('domain/pboHeaderEntry', function () {
	describe('ctor', function () {
		it('should throw if called with illegal args', function () {
			expect(function () {
				new PboHeaderEntry(null, null, null, null, null);
			}).to.throw(/name/);

			expect(function () {
				new PboHeaderEntry('', null, null, null, null);
			}).to.throw(/packingMethod/);

			expect(function () {
				new PboHeaderEntry('', PackingMethod.uncompressed, null, null, null);
			}).to.throw(/originalSize/);

			expect(function () {
				new PboHeaderEntry('', PackingMethod.uncompressed, 1, null, null);
			}).to.throw(/timestamp/);

			expect(function () {
				new PboHeaderEntry('', PackingMethod.uncompressed, 1, 1, null);
			}).to.throw(/dataSize/);
		});
		
		it('should initialize object', function () {
			let entry = new PboHeaderEntry('entryName', PackingMethod.product, 10, 30, 40);

			expect(entry.name).to.equal('entryName');
			expect(entry.packingMethod).to.equal(PackingMethod.product);
			expect(entry.originalSize).to.equal(10);
			expect(entry.reserved).to.equal(0);
			expect(entry.timestamp).to.equal(30);
			expect(entry.dataSize).to.equal(40);
		});
	});

	describe('getSize', function () {
		it('should calculate the size', function () {
			let entry = new PboHeaderEntry('entryName', PackingMethod.product, 10, 30, 40);

			const size = entry.getSize();

			expect(size).to.equal(30);
		});
	});
});