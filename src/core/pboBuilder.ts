import * as File from 'vinyl';
import { StreamOptions } from './streamOptions';
import { HeaderEntry } from '../domain/headerEntry';
import { HeaderExtension } from '../domain/headerExtension';
import { Header } from '../domain/header';
import { PackingMethod } from '../domain/packingMethod';
import { PboFormatter } from './pboFormatter';
import { PackingFuncFactory } from './packingFuncFactory';

export class PboBuilder {
    build(files: File[], options: StreamOptions): Buffer {
        const extensions = options.extensions && Array.isArray(options.extensions)
            ? options.extensions.map(ext => new HeaderExtension(ext.name, ext.value))
            : [];

        const getPackingMethod = PackingFuncFactory.getPackingFunc(options);

        const entries = files.filter(file => !!file.contents).map(file => {
            const fileData = file.contents as Buffer;
            const timeStamp = file.stat!.mtime.getTime() / 1000;

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
}