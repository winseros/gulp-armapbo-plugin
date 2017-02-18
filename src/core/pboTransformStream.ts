import { Transform } from 'stream';
import { PboHeaderExtension } from '../domain/pboHeaderExtension';
import { PboBuilder } from './pboBuilder';
import { StreamOptions } from './streamOptions';
import * as path from 'path';
import * as File from 'vinyl';

export interface StreamCallback {
    (err?: Error, result?: File): void;
}
export class PboTransformStream extends Transform {
    private _contentParts: File[] = [];
    private _options: StreamOptions;

    private _builder = new PboBuilder();

    constructor(options?: StreamOptions) {
        super({ objectMode: true });
        this._options = options || {} as StreamOptions;
    }

    _transform(file: File, enc: string, cb: StreamCallback): void {
        if (file.isStream()) {
            cb(new Error('Streaming input is not supported'));
            return;
        }
        this._contentParts.push(file);
        cb();
    }

    _flush(cb: Function): void {
        const extensions = this._options.extensions && Array.isArray(this._options.extensions)
            ? this._options.extensions.map(ext => new PboHeaderExtension(ext.name, ext.value))
            : [];

        const data = this._builder.build(this._contentParts, extensions);

        const fileName = this._options.fileName || this._getDefaultName();
        const result = new File({ path: fileName, contents: data });

        this.push(result);
        cb();
    }

    _getDefaultName(): string {
        const cwd = process.cwd();
        const segments = cwd.split(path.sep);
        const name = `${segments[segments.length - 1]}.pbo`;
        return name;
    }
}
