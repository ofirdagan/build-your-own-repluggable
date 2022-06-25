// import {SlotKey, EntryPoint, Shell} from 'repluggable';
import {SlotKey, EntryPoint, Shell} from '../../src/repluggable';
import {FooApi} from './foo';


interface LazyApi {
    doSomething: () => void;
}
const createLazyApi = (): LazyApi => {
    return {
        doSomething: () => console.log(`LazyApi doSomthing was called`)
    }
}
export const LazyApi: SlotKey<LazyApi> = {
    name: 'LazyApi',
}

export const Lazy: EntryPoint = {
    name: 'Lazy',
    getDependencyAPIs() {
        return [];
    },
    declareAPIs() {
        return [LazyApi];
    },
    attach(shell: Shell) {
        console.log('lazy is attached (should be first)');
        // shell.contributeAPI(LazyApi, createLazyApi);
        setTimeout(() => shell.contributeAPI(LazyApi, createLazyApi), 2000);
    }
}