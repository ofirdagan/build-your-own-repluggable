import { AnyAction } from '@reduxjs/toolkit';
import { Shell, SlotKey } from '../repluggable';
// import { Shell, SlotKey } from 'repluggable';

interface CountersApi {
    getCounter1(): number;
    incCounter1(): void;
    getCounter2(): number;
    incCounter2(): void;
}

interface CountersState {
    counter1: number;
    counter2: number;
}

export interface FullCountersState {
    counters: CountersState
}

const IncCounter1Action = 'incCounter1';
const IncCounter2Action = 'incCounter2';

export function countersReducer(state: CountersState = {counter1: 0, counter2: 0}, action: AnyAction): CountersState {
    switch (action.type) {
        case IncCounter1Action:
            return {
                ...state,
                counter1: state.counter1 + 1
            }
            break;
        case IncCounter2Action:
            return {
                ...state,
                counter2: state.counter2 + 1
            }
            break;
        default:
            return state;

    }
}

export const CountersApi: SlotKey<CountersApi> = {
    name: 'CountersApi'
}

export const createCountersApi = (shell: Shell): CountersApi => {
    const store = shell.getStore<FullCountersState>();
    return {
        getCounter1: () => store.getState().counters.counter1,
        incCounter1: () => store.dispatch({type: IncCounter1Action}),
        getCounter2: () => store.getState().counters.counter2,
        incCounter2: () => store.dispatch({type: IncCounter2Action}),
    }
}