// import {connectWithShell, Shell} from 'repluggable';
import {connectWithShell, Shell} from '../../../repluggable';
import { CountersApi } from '../../counter-test-util';
import React, {FC} from 'react';

interface CounterProps {
    counter: number;
    incCounter(): void;
}
const CounterDumb: FC<CounterProps> = (props: CounterProps) => {
    return (
        <>
            <div>{props.counter}</div>
            <button onClick={props.incCounter}>Inc Me</button>
        </>
    )
}

export const createCounter1 = (boundShell: Shell) => connectWithShell(
    shell => ({counter: shell.getAPI(CountersApi).getCounter1()}),
    shell => ({incCounter: () => shell.getAPI(CountersApi).incCounter1()}),
    boundShell
)(CounterDumb)

export const createCounter2 = (boundShell: Shell) => connectWithShell(
    shell => ({counter: shell.getAPI(CountersApi).getCounter2()}),
    shell => ({incCounter: () => shell.getAPI(CountersApi).incCounter2()}),
    boundShell
)(CounterDumb)