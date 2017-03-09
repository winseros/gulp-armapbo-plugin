import { StreamOptions } from '../streamOptions';

export class CompressionReporter {
    private readonly _options: StreamOptions;

    constructor(options: StreamOptions) {
        this._options = options;
        this._normalizeOptions();
    }

    report(name: string, originalSize: number, compressedSize: number): void {

    }

    _normalizeOptions(): void {
        this._options.verbose = this._options.verbose !== false;
    }
}