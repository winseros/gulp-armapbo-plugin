/*import { PboHeaderEntry, PackingMethod } from '../domain/pboHeaderEntry';
import { PboHeaderExtension } from '../domain/pboHeaderExtension';
import { PboWriter } from './pboWriter';
import { Assert } from '../util/assert';
import { Sha1 } from './sha1';
import * as File from 'vinyl';

export interface EntriesCollection<T> extends Array<T> {
    size: number;
}

export class PboBuilder {
    private static signatureBlockSize = 20;

    build(entries: File[], extensions: PboHeaderExtension[]): Buffer {
        Assert.isNotNull(entries, 'entries');
        Assert.isNotNull(extensions, 'extensions');

        const signature = PboHeaderEntry.getSignatureEntry();
        let size = signature.getSize();

        const headerExtensions = this._getHeaderExtensions(extensions);
        size += headerExtensions.size + 1;//terminating null after the last one

        const headerEntries = this._getHeaderEntries(entries);
        size += headerEntries.size;

        const boundaryEntry = PboHeaderEntry.getBoundaryEntry();
        size += boundaryEntry.getSize();

        const writer = new PboWriter();

        const buffer = new Buffer(size + 1 + PboBuilder.signatureBlockSize);//1 terminating zero byte between data and signature

        let offset = writer.writeHeaderEntry(buffer, signature, 0);
        offset = this._writeHeaderExtensions(writer, headerExtensions, buffer, offset);
        offset = buffer.writeInt8(0, offset);
        offset = this._writeHeaderEntries(writer, headerEntries, buffer, offset);
        offset = writer.writeHeaderEntry(buffer, boundaryEntry, offset);

        offset = this._writeContents(headerEntries, buffer, offset);

        const dataChunk = buffer.slice(0, offset);
        const checkSum = new Sha1(dataChunk).get();

        offset = buffer.writeUInt8(0, offset);

        checkSum.copy(buffer, offset, 0);

        return buffer;
    }

    _getHeaderEntries(entries: File[]): EntriesCollection<PboHeaderEntry> {
        let size = 0;
        const converted = entries
            .filter(file => !!file.contents)//filter out directories
            .map(file => {
                const fileData = file.contents as Buffer;
                const timeStamp = file.stat.mtime.getTime() / 1000;

                const entry = new PboHeaderEntry(file.relative, PackingMethod.uncompressed, fileData.length, timeStamp, fileData.length);
                entry.contents = fileData;

                size += entry.getSize() + fileData.length;

                return entry;
            }) as EntriesCollection<PboHeaderEntry>;

        converted.size = size;
        return converted;
    }

    _getHeaderExtensions(entries: PboHeaderExtension[]): EntriesCollection<PboHeaderExtension> {
        const collection = entries as EntriesCollection<PboHeaderExtension>;
        collection.size = collection.reduce((size: number, e: PboHeaderExtension) => size += e.getSize(), 0);
        return collection;
    }

    _writeHeaderExtensions(writer: PboWriter, extensions: PboHeaderExtension[], buffer: Buffer, offset: number): number {
        extensions.forEach(extension => {
            offset = writer.writeHeaderExtension(buffer, extension, offset);
        });
        return offset;
    }

    _writeHeaderEntries(writer: PboWriter, entries: PboHeaderEntry[], buffer: Buffer, offset: number): number {
        entries.forEach(entry => {
            offset = writer.writeHeaderEntry(buffer, entry, offset);
        });
        return offset;
    }

    _writeContents(entries: PboHeaderEntry[], buffer: Buffer, offset: number): number {
        entries.forEach(entry => {
            offset += entry.contents.copy(buffer, offset, 0);
        });

        return offset;
    }
}
*/