import { Header } from '../domain/header';
import { BufferAllocator } from './bufferAllocator';
import { PboBodyWriter } from './pboBodyWriter';
import { PboHeaderWriter } from './pboHeaderWriter';
import { PboChecksumWriter } from './pboChecksumWriter';
import { StreamOptions } from './streamOptions';

export class PboFormatter {
    format(header: Header, options: StreamOptions): Buffer {
        const buf = new BufferAllocator().allocateBuffers(header);

        const bodySize = new PboBodyWriter(options).writeBody(buf.body, header);
        new PboHeaderWriter().writeHeader(buf.header, header);

        const contents = Buffer.from(buf.raw, 0, buf.header.length + bodySize);
        const signature = Buffer.from(buf.raw, contents.length, PboChecksumWriter.blockSize);
        new PboChecksumWriter().writeChecksum(contents, signature);

        const bytes = Buffer.from(buf.raw, 0, contents.length + PboChecksumWriter.blockSize);
        return bytes;
    }
}