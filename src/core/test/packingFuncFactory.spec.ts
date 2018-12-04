import * as File from 'vinyl';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { PackingMethod } from '../../domain/packingMethod';
import { PackingFuncFactory } from '../packingFuncFactory';
import { PatternMatcher } from '../patternMatcher';

describe('core/packingFuncFactory', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getPackingFunc', () => {
        it('should return a dummy func if options.compress is not specified', () => {
            const spyMatch = sandbox.spy(PatternMatcher.prototype, 'match');
            const file = new File({ path: 'some_file.txt' });

            const func = PackingFuncFactory.getPackingFunc({});
            const method = func(file);
            expect(method).to.equal(PackingMethod.uncompressed);

            expect(spyMatch.callCount).to.equal(0);
        });

        it('should handle options.compress as a string and non-zero length file content', () => {
            const stubMatch = sandbox.stub(PatternMatcher.prototype, 'match');
            stubMatch
                .onCall(0).returns(true)
                .onCall(1).returns(false)
                .onCall(2).returns(false);
            const spyCreate = sandbox.spy(PatternMatcher, 'create');

            const file = new File({ path: 'some_file.txt', contents: Buffer.allocUnsafe(1) });

            const func = PackingFuncFactory.getPackingFunc({ compress: '**/*' });
            const method1 = func(file);
            const method2 = func(file);
            const method3 = func(file);

            expect(method1).to.equal(PackingMethod.packed);
            expect(method2).to.equal(PackingMethod.uncompressed);
            expect(method3).to.equal(PackingMethod.uncompressed);

            expect(spyCreate.withArgs(['**/*']).callCount).to.equal(1);
            expect(stubMatch.withArgs(file.relative).callCount).to.equal(3);
        });

        it('should handle options.compress as a string and zero length file content', () => {
            const spyMatch = sandbox.spy(PatternMatcher.prototype, 'match');
            const spyCreate = sandbox.spy(PatternMatcher, 'create');

            const file = new File({ path: 'some_file.txt', contents: Buffer.allocUnsafe(0) });

            const func = PackingFuncFactory.getPackingFunc({ compress: '**/*' });
            const method = func(file);

            expect(method).to.equal(PackingMethod.uncompressed);

            expect(spyCreate.withArgs(['**/*']).callCount).to.equal(1);
            expect(spyMatch.callCount).to.equal(0);
        });

        it('should handle options.compress as an array and non-zero length file content', () => {
            const stubMatch = sandbox.stub(PatternMatcher.prototype, 'match');
            stubMatch
                .onCall(0).returns(true)
                .onCall(1).returns(false)
                .onCall(2).returns(false);
            const spyCreate = sandbox.spy(PatternMatcher, 'create');

            const file = new File({ path: 'some_file.txt', contents: Buffer.allocUnsafe(1) });

            const func = PackingFuncFactory.getPackingFunc({ compress: ['**/*', '!*.txt', true as any, {} as any, '1.txt'] });
            const method1 = func(file);
            const method2 = func(file);
            const method3 = func(file);

            expect(method1).to.equal(PackingMethod.packed);
            expect(method2).to.equal(PackingMethod.uncompressed);
            expect(method3).to.equal(PackingMethod.uncompressed);

            expect(spyCreate.withArgs(['**/*', '!*.txt', '1.txt']).callCount).to.equal(1);
            expect(stubMatch.withArgs(file.relative).callCount).to.equal(3);
        });

        it('should handle options.compress as an array and zero length file content', () => {
            const spyMatch = sandbox.spy(PatternMatcher.prototype, 'match');
            const spyCreate = sandbox.spy(PatternMatcher, 'create');

            const file = new File({ path: 'some_file.txt', contents: Buffer.allocUnsafe(0) });

            const func = PackingFuncFactory.getPackingFunc({ compress: ['**/*', '!*.txt'] });
            const method = func(file);

            expect(method).to.equal(PackingMethod.uncompressed);

            expect(spyCreate.withArgs(['**/*', '!*.txt']).callCount).to.equal(1);
            expect(spyMatch.callCount).to.equal(0);
        });

        it('should handle options.compress as an array of non-strings', () => {
            const spyMatch = sandbox.spy(PatternMatcher.prototype, 'match');
            const spyCreate = sandbox.spy(PatternMatcher, 'create');

            const file = new File({ path: 'some_file.txt', contents: Buffer.allocUnsafe(0) });

            const func = PackingFuncFactory.getPackingFunc({ compress: [true as any, {} as any] });
            const method = func(file);

            expect(method).to.equal(PackingMethod.uncompressed);

            expect(spyCreate.callCount).to.equal(0);
            expect(spyMatch.callCount).to.equal(0);
        });
    });
});