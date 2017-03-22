import { StreamOptions } from '../streamOptions';
import * as chalk from 'chalk';
import * as log from 'single-line-log';

export class LzhReporter {
    private readonly _options: StreamOptions;

    constructor(options: StreamOptions) {
        this._options = options;
        this._normalizeOptions();
    }

    reportOverall(uncompressedSize: number, compressedSize: number): void {
        if (this._options.verbose) {
            const percentage = this._getStyledPercentage(uncompressedSize, compressedSize);
            const text = `Overall compression: ${percentage}`;
            this._writeMessage(text);
        }
    }

    reportFile(name: string, originalSize: number, compressedSize: number): void {
        if (this._options.verbose) {
            const percentage = this._getStyledPercentage(originalSize, compressedSize);
            const text = `Compression: ${percentage} | ${name}`;
            this._writeMessage(text);
        }
    }

    reportProgress(name: string, originalSize: number, processedSize: number): void {
        if (this._options.progress) {
            if (processedSize < originalSize) {
                const percentage = Math.round(processedSize / originalSize * 100);
                const formatted = percentage < 10 ? `0${percentage}` : percentage;
                log.stdout(`Progress: ${formatted}% | ${name}`);
            } else {
                log.stdout('');
            }
        }
    }

    _normalizeOptions(): void {
        this._options.verbose = this._options.verbose !== false;
        this._options.progress = this._options.progress !== false;
    }

    _getStyledPercentage(originalSize: number, compressedSize: number): string {
        const percentage = Math.round((1 - compressedSize / originalSize) * 100);
        const style = this._getPercentageStyle(percentage);
        const formatted = percentage < 10 ? `0${percentage}` : percentage;
        const text = style(`${formatted}%`);
        return text;
    }

    _getPercentageStyle(percentage: number): chalk.Style {
        let style: chalk.Style;
        switch (true) {
            case (percentage > 30):
                style = chalk.green;
                break;
            case (percentage > 20):
                style = chalk.yellow;
                break;
            case (percentage > 10):
                style = chalk.cyan;
                break;
            default: {
                style = chalk.red;
            }
        }
        return style;
    }

    _writeMessage(message: string): void {
        console.log(message);
    }
}