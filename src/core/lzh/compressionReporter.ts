import { StreamOptions } from '../streamOptions';
import * as chalk from 'chalk';

export class CompressionReporter {
    private readonly _options: StreamOptions;

    constructor(options: StreamOptions) {
        this._options = options;
        this._normalizeOptions();
    }

    report(name: string, originalSize: number, compressedSize: number): void {
        if (this._options.verbose) {
            const percentage = this._getStyledPercentage(originalSize, compressedSize);
            const text = `Compression: ${percentage} | ${name}`;
            this._writeMessage(text);
        }
    }

    _normalizeOptions(): void {
        this._options.verbose = this._options.verbose !== false;
    }

    _getStyledPercentage(originalSize: number, compressedSize: number): string {
        const percentage = Math.floor((1 - compressedSize / originalSize) * 100);
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