import { EntryPoint, createAppHost } from "../../src/repluggable";

const Foo: EntryPoint = {
    name: 'Foo',
    attach() {
        console.log('foo is attached');
    }
}

createAppHost([Foo]);