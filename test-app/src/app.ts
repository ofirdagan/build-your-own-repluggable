import { createAppHost } from '../../src/repluggable';
// import { createAppHost } from 'repluggable';
import {Foo} from './foo';
import {Lazy} from './lazy';

//This is for testing w/ the real repluggable module
// declare global {
//     var window: any
// }

// global.window = {
//     requestAnimationFrame: () => {}
// }

const host = createAppHost([Foo]);
setTimeout(() => host.addShells([Lazy]), 1000);
