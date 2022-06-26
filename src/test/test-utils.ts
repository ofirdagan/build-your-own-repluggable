// import {SlotKey, EntryPoint, Shell} from 'repluggable';
import {SlotKey, EntryPoint, Shell} from '../repluggable';

export interface EntryPointOptions {
    name: string,
    depApi?: SlotKey<any>[]
    declareApi?: SlotKey<any>[]
    onAttach?: (shell: Shell) => void
    onExtend?: (shell: Shell) => void
}

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


export function createEntryPoint(options: EntryPointOptions): EntryPoint {
    const {name, depApi = [], declareApi = [], onAttach, onExtend} = options;
    return {
        name,
        getDependencyAPIs() {
            return depApi;
        },
        declareAPIs() {
            return declareApi;
        },
        attach(shell: Shell) {
            onAttach?.(shell);
        },
        extend(shell: Shell) {
            onExtend?.(shell);
        }
    }
}

interface LazyApi {
    doSomething: () => void;
}
export const createLazyApi = (): LazyApi => {
    return {
        doSomething: () => console.log(`LazyApi doSomthing was called`)
    }
}
export const LazyApi: SlotKey<LazyApi> = {
    name: 'LazyApi',
}

interface SomeApi {
    doSomething: () => void;
}
export const createSomeApi = (): SomeApi => {
    return {
        doSomething: () => console.log(`SomeApi doSomthing was called`)
    }
}
export const SomeApi: SlotKey<SomeApi> = {
    name: 'SomeApi',
}

interface Some2Api {
    doSomething: () => void;
}
export const createSome2Api = (): Some2Api => {
    return {
        doSomething: () => console.log(`SomeApi doSomthing was called`)
    }
}
export const Some2Api: SlotKey<Some2Api> = {
    name: 'Some2Api',
}