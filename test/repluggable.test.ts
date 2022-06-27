import { EntryPoint, createAppHost } from "../src/repluggable";
import { createEntryPoint, testLogsByOrder } from './test-utils';


describe(`step 1 - attach`, () => {
    it('should attach', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        createAppHost([Foo]);
        
        const expectedMessages = [`foo is attached`];
        expect(testLogsByOrder(consoleSpy, expectedMessages)).toBe(true);
    });

    it('should throw in case of duplicates entry points', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        expect(() => {
            createAppHost([Foo, Foo]);
        }).toThrowError(new Error('entry point w/ name Foo is already attahced'));
                
    });

    const Foo: EntryPoint = {
        name: 'Foo',
        attach() {
            console.log('foo is attached');
        }
    }

});

describe(`step 2 - addShells`, () => {
    
    it('should addShell lazy', async () => {
        const consoleSpy = jest.spyOn(console, 'log');
        const foo = createEntryPoint({
            name: 'foo',
            onAttach: () => {
                console.log('foo is attached');
            }
        })

        const lazy = createEntryPoint({
            name: 'lazy',
            onAttach: () => {
                console.log('lazy is attached');
            }
        })
                
        const host = createAppHost([foo]);
        await new Promise(res => {
            setTimeout(() => {
                host.addShells([lazy]);
                res(true);
            }, 200)
        });

        const expectedMessages = [`foo is attached`, `lazy is attached`];
        expect(testLogsByOrder(consoleSpy, expectedMessages)).toBe(true);
    });
});