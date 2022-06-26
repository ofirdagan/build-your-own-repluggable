// import { createAppHost } from '../../repluggable';
import { createAppHost } from 'repluggable';
import {Foo} from './foo';
import {Lazy} from './lazy';

const host = createAppHost([Foo]);
setTimeout(() => host.addShells([Lazy]), 1000);
