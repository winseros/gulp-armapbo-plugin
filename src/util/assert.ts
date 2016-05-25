export class Assert {
    static isString(input: string, paramName: string): void {
        if (typeof paramName !== 'string' || !paramName.length || !paramName.trim().length) {
            throw new Error('paramName should be a non-empty string');
        }
        if (typeof input !== 'string' || !input.length || !input.trim().length) {
            throw new Error(`${paramName} should be a non-empty string`);
        }
    }

    static isNumber(input: number, paramName: string) {
        Assert.isString(paramName, 'paramName');
        if (typeof (input) !== 'number') {
            throw new Error(`${paramName} should be a number`);
        }
    }

    static isNotNull(input: any, paramName: string) {
        Assert.isString(paramName, 'paramName');
        if (input === undefined || input === null){
            throw new Error(`${paramName} should not be null`);
        }
    }
}