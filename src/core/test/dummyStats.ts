import * as fs from 'fs';

export class DummyStats implements fs.Stats{

	constructor(size:number, mtime:Date)
	{
		this.size = size;
		this.mtime = mtime;
	}

	isFile():boolean {
		return null;
	}

	isDirectory():boolean {
		return null;
	}

	isBlockDevice():boolean {
		return null;
	}

	isCharacterDevice():boolean {
		return null;
	}

	isSymbolicLink():boolean {
		return null;
	}

	isFIFO():boolean {
		return null;
	}

	isSocket():boolean {
		return null;
	}

	dev:number;
	ino:number;
	mode:number;
	nlink:number;
	uid:number;
	gid:number;
	rdev:number;
	size:number;
	blksize:number;
	blocks:number;
	atime:Date;
	mtime:Date;
	ctime:Date;
	birthtime:Date;
}