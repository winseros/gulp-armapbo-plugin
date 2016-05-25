import {PboHeaderExtension} from '../pboHeaderExtension';
import {expect} from 'chai';

describe('domain/pboHeaderExtension', function () {
	describe('ctor', function () {
		it('should throw if called with illegal args', function () {
			expect(function () {
				new PboHeaderExtension(null, null);
			}).to.throw(/name/);

			expect(function () {
				new PboHeaderExtension('some-name', null);
			}).to.throw(/value/);
		});

		it('should initialize object', function () {
			let extension = new PboHeaderExtension('ext-name', 'some-value');

			const size = extension.getSize();

			expect(size).to.equal(20);
		});
	});
	
	describe('getBoundary', function () {
		it('returns a boundary entry', function () {
			let entry = PboHeaderExtension.getBoundary();

			expect(entry).not.to.equal(null);
			expect(entry).not.to.equal(undefined);

			expect(entry.name).to.equal('');
			expect(entry.value).to.equal('');
		});
	});
});