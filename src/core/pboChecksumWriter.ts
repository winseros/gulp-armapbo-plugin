import { Sha1 } from './sha1';

export class PboChecksumWriter {
    static blockSize = 21;//1 zero byte + 20bytes sha1

    writeChecksum(source: Buffer, target: Buffer): void {
        const sha = new Sha1(source);
        const checksum = sha.get();

        target.writeInt8(0, 0);
        checksum.copy(target, 1, 0, source.length);
    }
}