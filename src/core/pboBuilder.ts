import {IPboHeaderEntry, PboHeaderEntry, PackingMethod} from '../domain/pboHeaderEntry';
import {IPboHeaderExtension, PboHeaderExtension} from '../domain/pboHeaderExtension';
import {PboWriter} from './pboWriter';
import {Assert} from '../util/assert';
import {Sha1} from './sha1';
import * as File from 'vinyl';

interface EntriesCollection<T> extends Array<T> {
	size: number;
}

export class PboBuilder {

	private static signatureBlockSize = 20;

	build(contents: File[], headerExt: IPboHeaderExtension[]): Buffer {
		Assert.isNotNull(contents, 'contents');
		Assert.isNotNull(headerExt, 'headerExt');

		let size = 0;
		const signature = PboHeaderEntry.getSignatureEntry();
		size += signature.getSize();

		const headerExtensions = this.getHeaderExtensions(headerExt);
		size += headerExtensions.size + 1;//terminating null after the last one

		const headerEntries = this.getHeaderEntries(contents);
		size += headerEntries.size;

		const boundaryEntry = PboHeaderEntry.getBoundaryEntry();
		size += boundaryEntry.getSize();

		const writer = new PboWriter();

		let result = new Buffer(size + 1 + PboBuilder.signatureBlockSize);//1 terminating zero byte between data and signature

		let offset = writer.writeHeaderEntry(result, signature, 0);
		offset = this.writeHeaderExtensions(writer, headerExtensions, result, offset);
		offset = result.writeInt8(0, offset);
		offset = this.writeHeaderEntries(writer, headerEntries, result, offset);
		offset = writer.writeHeaderEntry(result, boundaryEntry, offset);

		offset = this.writeContents(headerEntries, result, offset);

		const dataChunk = result.slice(0, offset);
		const checkSum = new Sha1(dataChunk).get();

		offset = result.writeUInt8(0, offset);

		checkSum.copy(result, offset, 0);

		return result;
	}

	private getHeaderEntries(contents: File[]): EntriesCollection<IPboHeaderEntry> {
		let size = 0;
		let entries = contents.filter(file => {
			return file.contents ? true : false;//filter out directories
		}).map(file => {
			const fileData = file.contents as Buffer;
			const timeStamp = file.stat.mtime.getTime() / 1000;

			const entry = new PboHeaderEntry(file.relative, PackingMethod.uncompressed, fileData.length, timeStamp, fileData.length);
			entry.contents = fileData;

			size += entry.getSize() + fileData.length;

			return entry;
		}) as EntriesCollection<IPboHeaderEntry>;

		entries.size = size;
		return entries;
	}

	private getHeaderExtensions(entries: IPboHeaderExtension[]): EntriesCollection<PboHeaderExtension> {
		let size = 0;
		let extensions = entries.map(entry => {
			const ext = PboHeaderExtension.fromObject(entry);
			size += ext.getSize();
			return ext;
		}) as EntriesCollection<PboHeaderExtension>;
		extensions.size = size;
		return extensions;
	}

	private writeHeaderExtensions(writer: PboWriter, extensions: PboHeaderExtension[], buffer: Buffer, offset: number): number {
		extensions.forEach(extension => {
			offset = writer.writeHeaderExtension(buffer, extension, offset);
		});
		return offset;
	}

	private writeHeaderEntries(writer: PboWriter, entries: IPboHeaderEntry[], buffer: Buffer, offset: number): number {
		entries.forEach(entry => {
			offset = writer.writeHeaderEntry(buffer, entry, offset);
		});
		return offset;
	}

	private writeContents(entries: IPboHeaderEntry[], buffer: Buffer, offset: number): number {
		entries.forEach(entry => {
			offset += entry.contents.copy(buffer, offset, 0);
		});

		return offset;
	}
}
