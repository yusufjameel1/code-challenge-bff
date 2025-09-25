class Logger {
    private static instance: Logger;

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public info(message: string, ...args: any[]): void {
        console.log(message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        console.error(message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        console.warn(message, ...args);
    }

    public debug(message: string, ...args: any[]): void {
        console.debug(message, ...args);
    }
}

export default Logger;