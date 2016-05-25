import {PboTransformStream} from './core/pboTransformStream';
import {IPboHeaderExtension} from './domain/pboHeaderExtension';

export = function (pboFileName:string, headerExt:IPboHeaderExtension[]):PboTransformStream {
	return new PboTransformStream(pboFileName, headerExt);
};