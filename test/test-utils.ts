import {EntryPoint} from '../src/repluggable';

export function testLogsByOrder(logSpy: jest.SpyInstance, logs: string[]): boolean {
    const logMessages = logSpy.mock.calls.map(msgArr => msgArr[0]);
    let currentIndex = Number.MIN_SAFE_INTEGER;
    return logs.every(message => {
        const index = logMessages.indexOf(message);
        if (index === -1 || index < currentIndex) {
            return false;
        } else {
            currentIndex = logMessages.indexOf(message);
            return true;
        }
    });
}

export interface EntryPointOptions {
    name: string,
    onAttach?: () => void
}

export function createEntryPoint(options: EntryPointOptions): EntryPoint {
    const {onAttach, name} = options;
    return {
        name,
        attach() {
            onAttach?.();
        },
    }
}