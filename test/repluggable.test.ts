import { EntryPoint, createAppHost } from "../src/repluggable";
import { testLogsByOrder } from './test-utils';


describe(`step 1 - attach`, () => {
    it('should attach', () => {
        const consoleSpy = jest.spyOn(console, 'log');
        
        createAppHost([Foo]);
        
        const expectedMessages = [`foo is attached`]
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