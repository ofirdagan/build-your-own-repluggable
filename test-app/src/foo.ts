// import {SlotKey, EntryPoint, Shell} from 'repluggable';
import {SlotKey, EntryPoint, Shell} from '../../src/repluggable';
import {LazyApi} from './lazy';

interface FooApi {
    doFoo: () => void
}

const createFooApi = (): FooApi => {
    return {
        doFoo: () => console.log(`just did fooo 💨`)
    }
}

export const FooApi: SlotKey<FooApi> = {
    name: 'FooApi'
}

export const Foo: EntryPoint = {
    name: 'Foo',
    getDependencyAPIs() {
        return [LazyApi]
    },
    declareAPIs() {
        return [FooApi];
    },
    attach(shell: Shell) {
        console.log('foo is attached (should be after lazy)');
        shell.contributeAPI(FooApi, createFooApi);
    },
    extend(shell: Shell) {
        shell.getAPI(LazyApi).doSomething();
    }
}