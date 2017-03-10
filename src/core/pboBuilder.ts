import * as File from 'vinyl';
import * as minimatch from 'minimatch';
import { StreamOptions } from './streamOptions';
import { HeaderEntry } from '../domain/headerEntry';
import { HeaderExtension } from '../domain/headerExtension';
import { Header } from '../domain/header';
import { PackingMethod } from '../domain/packingMethod';
import { PboFormatter } from './pboFormatter';

export class PboBuilder {
    build(files: File[], options: StreamOptions): Buffer {
        const extensions = options.extensions && Array.isArray(options.extensions)
            ? options.extensions.map(ext => new HeaderExtension(ext.name, ext.value))
            : [];

        const getPackingMethod = this._getPackingMethodFunc(options);

        const entries = files.map(file => {
            const fileData = file.contents as Buffer;
            const timeStamp = file.stat.mtime.getTime() / 1000;

            const packingMethod = getPackingMethod(file);

            const entry = new HeaderEntry(file.relative, packingMethod, fileData.length, timeStamp);
            entry.contents = fileData;
            entry.dataSize = fileData.length;

            return entry;
        }).sort((a, b) => {
            if (a.packingMethod === b.packingMethod) { return 0; }
            if (a.packingMethod === PackingMethod.packed) { return 1; }//unpacked files first to create a buffer for lzh compression
            return -1;
        });

        const header = new Header(extensions, entries);
        const buf = new PboFormatter().format(header, options);
        return buf;
    }

    _getPackingMethodFunc(options: StreamOptions): (f: File) => PackingMethod {
        const compress = options.compress;
        switch (true) {
            case (typeof compress === 'string'): {
                return (f: File) => (f.contents as Buffer).length && minimatch(f.relative, compress as string) ? PackingMethod.packed : PackingMethod.uncompressed;
            }
            case (Array.isArray(compress)): {
                const patterns = (compress as string[]).filter(s => !!(typeof s === 'string' && s.trim()));
                const func = patterns.length
                    ? (f: File) => (f.contents as Buffer).length && patterns.some(p => minimatch(f.relative, p)) ? PackingMethod.packed : PackingMethod.uncompressed
                    : () => PackingMethod.uncompressed;
                return func;
            }
            default: {
                return () => PackingMethod.uncompressed;
            }
        }
    }
}