import { expect } from 'chai';
import * as sinon from 'sinon';
import * as chalk from 'chalk';
import { CompressionReporter } from '../compressionReporter';
import { StreamOptions } from '../../streamOptions';

describe('compressionReporter', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('ctor', () => {
        it('should set options.verbose to true if it is not false', () => {
            //tslint:disable:no-unused-new

            const options = {} as StreamOptions;
            new CompressionReporter(options);
            expect(options.verbose).to.equal(true);

            options.verbose = 1 as any;
            new CompressionReporter(options);
            expect(options.verbose).to.equal(true);

            options.verbose = {} as any;
            new CompressionReporter(options);
            expect(options.verbose).to.equal(true);

            options.verbose = '' as any;
            new CompressionReporter(options);
            expect(options.verbose).to.equal(true);

            //tslint:enable:no-unused-new
        });

        it('should leave options.verbose as false', () => {
            //tslint:disable:no-unused-new

            const options = { verbose: false } as StreamOptions;
            new CompressionReporter(options);
            expect(options.verbose).to.equal(false);

            //tslint:enable:no-unused-new
        });
    });

    describe('reportOverall', () => {
        it('should do nothing if options.verbose is false', () => {
            const spyGetPercentage = sandbox.spy(CompressionReporter.prototype, '_getStyledPercentage');
            const spyWrite = sandbox.spy(CompressionReporter.prototype, '_writeMessage');

            const reporter = new CompressionReporter({ verbose: false });
            reporter.reportOverall(20, 10);

            expect(spyGetPercentage.callCount).to.equal(0);
            expect(spyWrite.callCount).to.equal(0);
        });

        it('should report if options.verbose is true', () => {
            const stubGetPercentage = sandbox.stub(CompressionReporter.prototype, '_getStyledPercentage');
            stubGetPercentage.returns('a-percentage');

            const stubWrite = sandbox.stub(CompressionReporter.prototype, '_writeMessage');

            const reporter = new CompressionReporter({ verbose: true });
            reporter.reportOverall(20, 10);

            expect(stubGetPercentage.withArgs(20, 10).callCount).to.equal(1);
            expect(stubWrite.withArgs('Overall compression: a-percentage').callCount).to.equal(1);
        });
    });

    describe('reportFile', () => {
        it('should do nothing if options.verbose is false', () => {
            const spyGetPercentage = sandbox.spy(CompressionReporter.prototype, '_getStyledPercentage');
            const spyWrite = sandbox.spy(CompressionReporter.prototype, '_writeMessage');

            const reporter = new CompressionReporter({ verbose: false });
            reporter.reportFile('a-file', 20, 10);

            expect(spyGetPercentage.callCount).to.equal(0);
            expect(spyWrite.callCount).to.equal(0);
        });

        it('should report if options.verbose is true', () => {
            const stubGetPercentage = sandbox.stub(CompressionReporter.prototype, '_getStyledPercentage');
            stubGetPercentage.returns('a-percentage');

            const stubWrite = sandbox.stub(CompressionReporter.prototype, '_writeMessage');

            const reporter = new CompressionReporter({ verbose: true });
            reporter.reportFile('a-file', 20, 10);

            expect(stubGetPercentage.withArgs(20, 10).callCount).to.equal(1);
            expect(stubWrite.withArgs('Compression: a-percentage | a-file').callCount).to.equal(1);
        });
    });

    describe('_getStyledPercentage', () => {
        it('should return a red-styled percentage', () => {
            const reporter = new CompressionReporter({});

            let styled = reporter._getStyledPercentage(100, 91);
            let expected = chalk.red('09%');
            expect(styled).to.eq(expected);

            styled = reporter._getStyledPercentage(100, 90);
            expected = chalk.red('10%');
            expect(styled).to.eq(expected);
        });

        it('should return a cyan-styled percentage', () => {
            const reporter = new CompressionReporter({});

            let styled = reporter._getStyledPercentage(100, 89);
            let expected = chalk.cyan('11%');
            expect(styled).to.eq(expected);

            styled = reporter._getStyledPercentage(100, 80);
            expected = chalk.cyan('20%');
            expect(styled).to.eq(expected);
        });

        it('should return a yellow-styled percentage', () => {
            const reporter = new CompressionReporter({});

            let styled = reporter._getStyledPercentage(100, 79);
            let expected = chalk.yellow('21%');
            expect(styled).to.eq(expected);

            styled = reporter._getStyledPercentage(100, 70);
            expected = chalk.yellow('30%');
            expect(styled).to.eq(expected);
        });

        it('should return a green-styled percentage', () => {
            const reporter = new CompressionReporter({});

            const styled = reporter._getStyledPercentage(100, 69);
            const expected = chalk.green('31%');
            expect(styled).to.eq(expected);
        });
    });

    describe('_writeMessage', () => {
        it('should write message to console', () => {
            const stubLog = sandbox.stub(console, 'log');

            const reporter = new CompressionReporter({});

            reporter._writeMessage('a-message');

            expect(stubLog.withArgs('a-message').callCount).to.equal(1);
        });
    });
});