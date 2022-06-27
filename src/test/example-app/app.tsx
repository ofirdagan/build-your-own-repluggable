import React from 'react';
import { createAppHost, AppMainView } from '../../repluggable';
// import { createAppHost, AppMainView } from 'repluggable';
import ReactDOM from 'react-dom';
import {createEntryPoint} from '../test-utils';
import {CountersApi, countersReducer, createCountersApi, FullCountersState} from '../counter-test-util';
import { createCounter1, createCounter2 } from './components/Counter';

const countersApiEntryPoint = createEntryPoint({
    name: `countersApiEntryPoint`,
    declareApi: [CountersApi],
    onExtend: shell => {
        shell.contributeAPI(CountersApi, () => createCountersApi(shell));
        shell.contributeState<FullCountersState>(() => ({counters: countersReducer}));
    }
});

const counter1EntryPoint = createEntryPoint({
    name: `counter1EntryPoint`,
    depApi: [CountersApi],
    onExtend: shell => {
        const Counter1 = createCounter1(shell);
        shell.contributeMainView(shell, () => <><Counter1 counter={0} incCounter={() => {}}/></>)
    }
});

const counter2LazyEntryPoint = createEntryPoint({
    name: `counter2EntryPoint`,
    depApi: [CountersApi],
    onExtend: shell => {
        const Counter2 = createCounter2(shell);
        shell.contributeMainView(shell, () => <><Counter2 counter={0} incCounter={() => {}}/></>)
    }
});


const host = createAppHost([countersApiEntryPoint]);
setTimeout(() => host.addShells([counter1EntryPoint]));
setTimeout(() => host.addShells([counter2LazyEntryPoint]), 2500);

    
const container = document.getElementById('root');
ReactDOM.render(<AppMainView host={host}/>, container);