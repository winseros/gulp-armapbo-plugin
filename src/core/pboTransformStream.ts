import * as stream from 'stream';
import {Assert} from '../util/assert';
import {IPboHeaderExtension} from '../domain/pboHeaderExtension';
import {PboBuilder} from './pboBuilder';
import File = require('vinyl');

interface VinylTransformCallback {
	(err?:any, result?:File):void
}

export class PboTransformStream extends stream.Transform {
	private contentParts:File[] = [];
	private headerExtensions:IPboHeaderExtension[];

	constructor(private pboFileName:string,
				headerExtensions?:IPboHeaderExtension[]) {
		super({objectMode: true});
		Assert.isString(pboFileName, 'pboFileName');

		this.headerExtensions = headerExtensions || [];
	}

	_transform(file:File, encoding:string, callback:VinylTransformCallback):void {
		if (file.isStream()) {
			callback(new Error('Streaming input is not supported'));
			return;
		}
		this.contentParts.push(file);
		callback();
	}

	_flush(callback:VinylTransformCallback):void {
		let builder = new PboBuilder();
		const data = builder.build(this.contentParts, this.headerExtensions);

		let result = new File({path: this.pboFileName, contents: data});
		this.push(result);

		callback();
	}
}