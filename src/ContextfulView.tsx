import { Store } from '@reduxjs/toolkit'
import React, {FC} from 'react'
import { Provider, ReactReduxContextValue } from 'react-redux'

interface ContextfulViewProps {
    store: Store
    context: React.Context<ReactReduxContextValue>
    view: () => React.ReactNode
}

export const ContextfulView: FC<ContextfulViewProps> = (props: ContextfulViewProps) => {
    return  (
        <Provider store={props.store} context={props.context}>
            {props.view()}
        </Provider>
      );
}