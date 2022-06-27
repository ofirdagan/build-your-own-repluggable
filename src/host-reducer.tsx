import React from 'react';
import { AnyAction } from 'redux';
import { Shell } from './repluggable';
import {ContextfulView} from './ContextfulView';

export interface HostState {
    views: React.ReactNode[]
}

const ADD_VIEW = 'AddView';

export const AddView = (shell: Shell, view: () => React.ReactNode) => {
    return {
        type: ADD_VIEW,
        payload: <ContextfulView store={shell.getStore()} context={shell.getContext()} view={view}/>
    }
}

export function hostReducer(state: HostState = {views: []}, action: AnyAction) {
    switch(action.type) {
        case ADD_VIEW:
            return {
                ...state,
                views: [...state.views, action.payload]
            };
        default:
            return state;
    }
}

