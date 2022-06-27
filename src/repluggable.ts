import { configureStore, ReducersMapObject } from '@reduxjs/toolkit';
import React, {createContext} from 'react';
import { connect, ReactReduxContextValue } from 'react-redux';
import { AnyAction, combineReducers, Store} from 'redux';
import { AddView, hostReducer } from './host-reducer';
import { AppMainView as mainView } from './AppMainView';

export const AppMainView = mainView;

export interface Shell {
    contributeState<T>(reducerMapObjectFactory: () => ReducersMapObject<T>): void;
    contributeAPI<T>(key: SlotKey<T>, apiFactory: () => T): void;
    getAPI<T>(key: SlotKey<T>): T;
    getStore<T>(): Store;
    getContext(): React.Context<ReactReduxContextValue>;
    contributeMainView(shell: Shell, view: () => React.ReactNode): void;
}

export interface SlotKey<T> {
    name: string
}

export interface EntryPoint {
    name: string;
    attach?(shell: Shell): void;
    getDependencyAPIs?(): SlotKey<any>[];
    declareAPIs?(): SlotKey<any>[];
    extend?(shell: Shell): void;
}

export interface Host {
    addShells(entryPoints: EntryPoint[]): void;
    contributeAPI<T>(entryPoint: EntryPoint, key: SlotKey<T>, apiFactory: () => T): void;
    contributedApis: {[key: string]: ApiFactory<any>};
    addReducerToStore<T>(reducer: () => ReducersMapObject<T>): void
    getHostStore<T>(): Store<T>;
    getContext(): React.Context<ReactReduxContextValue>
}

type ApiFactory<T> = () => T;

class ShellImpl implements Shell {
    
    private host: Host;
    private entryPoint: EntryPoint;
    
    constructor(host: Host, entryPoint: EntryPoint) {
        this.host = host;
        this.entryPoint = entryPoint;
    }
    getStore<T>(): Store {
        return this.host.getHostStore();
    }

    getAPI<T>(key: SlotKey<T>): T {
        if (!this.host.contributedApis[key.name]) {
            throw new Error(`${key.name} API does not exists on host`);
        }
        return this.host.contributedApis[key.name]();
    }
    
    contributeAPI<T>(key: SlotKey<T>, apiFactory: ApiFactory<T>): void {
        this.host.contributeAPI(this.entryPoint, key, apiFactory);
    }

    contributeState<T>(reducerMapObjectFactory: () => ReducersMapObject<T>) {
        this.host.addReducerToStore(reducerMapObjectFactory);
    }

    getContext(): React.Context<ReactReduxContextValue> {
        return this.host.getContext();
    }

    contributeMainView(shell: Shell, view: () => React.ReactNode) {
        this.getStore().dispatch(AddView(shell, view));
    }
}

class HostImpl implements Host {
    
    private attachedEntryPoints: {[key: string]: Shell} = {};
    private unresolvedEntryPoints: EntryPoint[] = [];
    public contributedApis: {[key: string]: ApiFactory<any>} = {};
    private apiToEntryPoint: {[key: string]: EntryPoint} = {};
    private store: Store;
    private asyncReducers: ReducersMapObject = {};
    private context: React.Context<ReactReduxContextValue>

    public constructor() {
        this.store = configureStore({
            reducer: this.createReducer()
        });
        this.context = createContext<ReactReduxContextValue>({} as ReactReduxContextValue<any, AnyAction>);
    }
    getContext(): React.Context<ReactReduxContextValue> {
        return this.context
    }

    public getHostStore(): Store<any, AnyAction> {
        return this.store;
    }

    public addReducerToStore<T>(reducerFactory: () => ReducersMapObject<T>): void {
        this.asyncReducers = {
            ...this.asyncReducers,
            ...reducerFactory()
        }
        this.store.replaceReducer(this.createReducer());
    }

    private createReducer = () => {
        return combineReducers({
            host: hostReducer,
            ...this.asyncReducers
        })
    }
    
    public addShells = (entryPoints: EntryPoint[]) => {
        entryPoints.forEach(entryPoint => {
            const hasBeenAddedAlready = this.attachedEntryPoints[entryPoint.name] || this.unresolvedEntryPoints.includes(entryPoint);
            if (hasBeenAddedAlready) {
                throw new Error(`entry point ${entryPoint.name} has already been added to host`);
            }
            this.registeredDeclaredApis(entryPoint);
            this.tryToAttach(entryPoint);
        });
    }
    
    public contributeAPI<T>(entryPoint: EntryPoint, key: SlotKey<T>, apiFactory: ApiFactory<T>) {
        if (this.contributedApis[key.name]) {
            throw new Error(`API ${key.name} is already registered`);
        }
        const didDeclareApi = entryPoint.declareAPIs?.().some(api => api.name === key.name);
        if (!didDeclareApi) {
            throw new Error(`Entry point ${entryPoint.name} tried to contribue ${key.name} w/o declaring it`)
        }
        this.contributedApis[key.name] = apiFactory;
        this.tryToAttachUnresolvedEntryPoints();
    }

    private registeredDeclaredApis(entryPoint: EntryPoint) {
        entryPoint.declareAPIs?.().forEach(api => {
            if (this.apiToEntryPoint[api.name]) {
                throw new Error(`API ${api.name} already declared by entry point ${this.apiToEntryPoint[api.name].name}`);
            }
            this.apiToEntryPoint[api.name] = entryPoint;
        });
    }
    
    private tryToAttach = (entryPoint: EntryPoint, visitedEntryPoints: string[] = []): boolean => {
        if (this.attachedEntryPoints[entryPoint.name]) {
            return true;
        }
        if (visitedEntryPoints.includes(entryPoint.name)) {
            throw new Error(`entry point ${entryPoint.name} has circular dependency: ${JSON.stringify(visitedEntryPoints)}`);
        }

        const isReadyToAttach = entryPoint.getDependencyAPIs?.().every(depApi => {
            if (this.contributedApis[depApi.name]) {
                return true;
            }
            const depEntryPoint = this.apiToEntryPoint[depApi.name];
            if (!depEntryPoint) {
                return false;
            }
            return this.tryToAttach(depEntryPoint, [...visitedEntryPoints, entryPoint.name]);
        });

        if (isReadyToAttach) {
            this.attachAndExtend(entryPoint);
            return true;
        } else {
            this.unresolvedEntryPoints.push(entryPoint);
            return false;
        }
    }

    private attachAndExtend(entryPoint: EntryPoint) {
        const shell = new ShellImpl(this, entryPoint);
        this.attachedEntryPoints[entryPoint.name] = shell;
        entryPoint.attach?.(shell);
        entryPoint.extend?.(shell);
    }

    private tryToAttachUnresolvedEntryPoints() {
        const notAttahced = [...this.unresolvedEntryPoints];
        this.unresolvedEntryPoints = [];
        notAttahced.forEach(ep => this.tryToAttach(ep));
    }
}

export const connectWithShell = (mapStateToProps: (shell: Shell) => any, mapDispatchToProps: (shell: Shell) => any, boundShell: Shell) => {
    return connect(() => mapStateToProps(boundShell), () => mapDispatchToProps(boundShell), null, {context: boundShell.getContext()});
}

export const createAppHost = (entryPoints: EntryPoint[]): Host => {
    const host: Host = new HostImpl();
    host.addShells(entryPoints);
    return host;
};