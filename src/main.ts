import {PboTransformStream, IPboStreamOptions} from './core/pboTransformStream';

export = function (pboFileName:string, options:IPboStreamOptions):PboTransformStream {
	return new PboTransformStream(pboFileName, options);
};