import { expect } from 'chai';
import * as sinon from 'sinon';
import * as chalk from 'chalk';
import * as log from 'single-line-log';
import { LzhReporter } from '../lzhReporter';
import { StreamOptions } from '../../streamOptions';

describe('lzhReporter', () => {
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
            new LzhReporter(options);
            expect(options.verbose).to.equal(true);

            options.verbose = 1 as any;
            new LzhReporter(options);
            expect(options.verbose).to.equal(true);

            options.verbose = {} as any;
            new LzhReporter(options);
            expect(options.verbose).to.equal(true);

            options.verbose = '' as any;
            new LzhReporter(options);
            expect(options.verbose).to.equal(true);

            //tslint:enable:no-unused-new
        });

        it('should leave options.verbose as false', () => {
            //tslint:disable:no-unused-new

            const options = { verbose: false } as StreamOptions;
            new LzhReporter(options);
            expect(options.verbose).to.equal(false);

            //tslint:enable:no-unused-new
        });

        it('should set options.progress to true if it is not false', () => {
            //tslint:disable:no-unused-new

            const options = {} as StreamOptions;
            new LzhReporter(options);
            expect(options.progress).to.equal(true);

            options.verbose = 1 as any;
            new LzhReporter(options);
            expect(options.progress).to.equal(true);

            options.verbose = {} as any;
            new LzhReporter(options);
            expect(options.progress).to.equal(true);

            options.verbose = '' as any;
            new LzhReporter(options);
            expect(options.progress).to.equal(true);

            //tslint:enable:no-unused-new
        });

        it('should leave options.progress as false', () => {
            //tslint:disable:no-unused-new

            const options = { progress: false } as StreamOptions;
            new LzhReporter(options);
            expect(options.progress).to.equal(false);

            //tslint:enable:no-unused-new
        });
    });

    describe('reportOverall', () => {
        it('should do nothing if options.verbose is false', () => {
            const spyGetPercentage = sandbox.spy(LzhReporter.prototype, '_getStyledPercentage');
            const spyWrite = sandbox.spy(LzhReporter.prototype, '_writeMessage');

            const reporter = new LzhReporter({ verbose: false });
            reporter.reportOverall(20, 10);

            expect(spyGetPercentage.callCount).to.equal(0);
            expect(spyWrite.callCount).to.equal(0);
        });

        it('should report if options.verbose is true', () => {
            const stubGetPercentage = sandbox.stub(LzhReporter.prototype, '_getStyledPercentage');
            stubGetPercentage.returns('a-percentage');

            const stubWrite = sandbox.stub(LzhReporter.prototype, '_writeMessage');

            const reporter = new LzhReporter({ verbose: true });
            reporter.reportOverall(20, 10);

            expect(stubGetPercentage.withArgs(20, 10).callCount).to.equal(1);
            expect(stubWrite.withArgs('Overall compression: a-percentage').callCount).to.equal(1);
        });
    });

    describe('reportFile', () => {
        it('should do nothing if options.verbose is false', () => {
            const spyGetPercentage = sandbox.spy(LzhReporter.prototype, '_getStyledPercentage');
            const spyWrite = sandbox.spy(LzhReporter.prototype, '_writeMessage');

            const reporter = new LzhReporter({ verbose: false });
            reporter.reportFile('a-file', 20, 10);

            expect(spyGetPercentage.callCount).to.equal(0);
            expect(spyWrite.callCount).to.equal(0);
        });

        it('should report if options.verbose is true', () => {
            const stubGetPercentage = sandbox.stub(LzhReporter.prototype, '_getStyledPercentage');
            stubGetPercentage.returns('a-percentage');

            const stubWrite = sandbox.stub(LzhReporter.prototype, '_writeMessage');

            const reporter = new LzhReporter({ verbose: true });
            reporter.reportFile('a-file', 20, 10);

            expect(stubGetPercentage.withArgs(20, 10).callCount).to.equal(1);
            expect(stubWrite.withArgs('Compression: a-percentage | a-file').callCount).to.equal(1);
        });
    });

    describe('reportProgress', () => {
        it('should do nothing if options.progress is false', () => {
            const spyLog = sandbox.spy(log, 'stdout');

            const reporter = new LzhReporter({ progress: false });
            reporter.reportProgress('a-file', 20, 10);

            expect(spyLog.callCount).to.equal(0);
        });

        it('should report if options.progress is true and progress is a 1-number digit', () => {
            const stubLog = sandbox.stub(log, 'stdout');

            const reporter = new LzhReporter({ progress: true });

            reporter.reportProgress('a-file', 100, 9);
            expect(stubLog.withArgs('Progress: 09% | a-file').callCount).to.equal(1);
        });

        it('should report if options.progress is true and progress is a 2-number digit', () => {
            const stubLog = sandbox.stub(log, 'stdout');

            const reporter = new LzhReporter({ progress: true });

            reporter.reportProgress('a-file', 20, 5);
            expect(stubLog.withArgs('Progress: 25% | a-file').callCount).to.equal(1);
        });

        it('should report if options.progress is true and progress is 100%', () => {
            const stubLog = sandbox.stub(log, 'stdout');

            const reporter = new LzhReporter({ progress: true });

            reporter.reportProgress('a-file', 20, 20);
            expect(stubLog.withArgs('').callCount).to.equal(1);
        });
    });

    describe('_getStyledPercentage', () => {
        it('should return a red-styled percentage', () => {
            const reporter = new LzhReporter({});

            let styled = reporter._getStyledPercentage(100, 91);
            let expected = chalk.red('09%');
            expect(styled).to.eq(expected);

            styled = reporter._getStyledPercentage(100, 90);
            expected = chalk.red('10%');
            expect(styled).to.eq(expected);
        });

        it('should return a cyan-styled percentage', () => {
            const reporter = new LzhReporter({});

            let styled = reporter._getStyledPercentage(100, 89);
            let expected = chalk.cyan('11%');
            expect(styled).to.eq(expected);

            styled = reporter._getStyledPercentage(100, 80);
            expected = chalk.cyan('20%');
            expect(styled).to.eq(expected);
        });

        it('should return a yellow-styled percentage', () => {
            const reporter = new LzhReporter({});

            let styled = reporter._getStyledPercentage(100, 79);
            let expected = chalk.yellow('21%');
            expect(styled).to.eq(expected);

            styled = reporter._getStyledPercentage(100, 70);
            expected = chalk.yellow('30%');
            expect(styled).to.eq(expected);
        });

        it('should return a green-styled percentage', () => {
            const reporter = new LzhReporter({});

            const styled = reporter._getStyledPercentage(100, 69);
            const expected = chalk.green('31%');
            expect(styled).to.eq(expected);
        });
    });

    describe('_writeMessage', () => {
        it('should write message to console', () => {
            const stubLog = sandbox.stub(console, 'log');

            const reporter = new LzhReporter({});

            reporter._writeMessage('a-message');

            expect(stubLog.withArgs('a-message').callCount).to.equal(1);
        });
    });
});