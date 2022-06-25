import { EntryPoint, createAppHost } from "../../src/repluggable";

const Foo: EntryPoint = {
    name: 'Foo',
    attach() {
        console.log('foo is attached');
    }
}

const Lazy: EntryPoint = {
    name: "Lazy",
    attach() {
        console.log('lazy is attached');
    }
}

const host = createAppHost([Foo]);
setTimeout(() => host.addShells([Lazy]), 1000);
