

export interface Shell {
    contributeAPI<T>(key: SlotKey<T>, apiFactory: () => T): void;
    getAPI<T>(key: SlotKey<T>): T;
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
}

type ApiFactory<T> = () => T;

class ShellImpl implements Shell {
    
    private host: Host;
    private entryPoint: EntryPoint;
    
    constructor(host: Host, entryPoint: EntryPoint) {
        this.host = host;
        this.entryPoint = entryPoint;
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
}

class HostImp implements Host {
    
    private attachedEntryPoints: {[key: string]: Shell} = {};
    private unresolvedEntryPoints: EntryPoint[] = [];
    public contributedApis: {[key: string]: ApiFactory<any>} = {};
    private apiToEntryPoint: {[key: string]: EntryPoint} = {};
    
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

    registeredDeclaredApis(entryPoint: EntryPoint) {
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


export const createAppHost = (entryPoints: EntryPoint[]): Host => {
    const host: Host = new HostImp();
    host.addShells(entryPoints);
    return host;
};