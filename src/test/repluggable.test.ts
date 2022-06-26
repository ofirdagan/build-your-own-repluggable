import { createAppHost } from '../repluggable';
// import { createAppHost } from 'repluggable';
import { createEntryPoint, createLazyApi,
    createSomeApi, LazyApi, 
    Some2Api, SomeApi, testLogsByOrder } from './test-utils';
    
    describe('step 3', () => {
        it('should load entry point after depencency api is contributed', async () => {
            const consoleSpy = jest.spyOn(console, 'log');
            const dependOnLazy = entryPointThatDependsOnLazy();
            const lazy = aLazyEntryPoint();
            
            const host = createAppHost([dependOnLazy]);
            await new Promise(res => {
                setTimeout(() => {
                    host.addShells([lazy]);
                    res(true);
                }, 100)
            });
            await new Promise(res => setTimeout(res, 1000));
            
            const expectedMessages = [
                `lazy is attached (should be first)`,
                `dependOnLazy is attached (should be after lazy)`,
                `LazyApi doSomthing was called`
            ]
            expect(testLogsByOrder(consoleSpy, expectedMessages)).toBe(true);
        });
        
        it('should throw on circular dependencies', async () => {
            const entryA = createEntryPoint({
                name: 'entryA',
                declareApi: [SomeApi],
                depApi: [Some2Api],
            });
            const entryB = createEntryPoint({
                name: 'entryB',
                declareApi: [Some2Api],
                depApi: [SomeApi],
            });
            
            expect(() => {
                createAppHost([entryA, entryB]);
            }).toThrowError(new Error('entry point entryB has circular dependency: [\"entryB\",\"entryA\"]'));
            
        })
        
        it('should throw on trying to add shell with same name', async () => {
            const entryA = createEntryPoint({
                name: 'entryA',
            });
            const entryB = createEntryPoint({
                name: 'entryA',
            });
            
            expect(() => {
                createAppHost([entryA, entryB]);
            }).toThrowError(new Error('entry point entryA has already been added to host'));
        });
        
        it('should throw on trying to contribute API w/o declaring it', async () => {
            const entryA = createEntryPoint({
                name: 'entryA',
                declareApi: [],
                onAttach: shell => {
                    shell.contributeAPI(SomeApi, createSomeApi);
                }
            });
            
            expect(() => {
                createAppHost([entryA]);
            }).toThrowError(new Error('Entry point entryA tried to contribue SomeApi w/o declaring it'));
            
        })
    });
    
    

function aLazyEntryPoint() {
    return createEntryPoint({
        name: 'lazy',
        declareApi: [LazyApi],
        onAttach: shell => {
            console.log('lazy is attached (should be first)');
            shell.contributeAPI(LazyApi, createLazyApi);
        },
    });
}

function entryPointThatDependsOnLazy() {
    return createEntryPoint({
        name: 'dependOnLazy',
        depApi: [LazyApi],
        onAttach: shell => console.log('dependOnLazy is attached (should be after lazy)'),
        onExtend: shell => {
            shell.getAPI(LazyApi).doSomething();
        }
    });
}
    