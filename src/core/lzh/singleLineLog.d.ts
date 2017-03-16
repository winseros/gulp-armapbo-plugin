declare module 'single-line-log' {
    interface OutputStream {
        (text: string): void;
        clear(): void;
    }

    interface Export {
        stdout: OutputStream;
        stderr: OutputStream;
    }

    const exp: Export;

    export = exp;
}