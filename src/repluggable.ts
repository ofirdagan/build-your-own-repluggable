

export interface EntryPoint {
    name: string;
    attach(): void
}

export interface Host {
    addShells(entryPoints: EntryPoint[]): void
}

class HostImp implements Host {
    private attachedEntryPoints: Set<string> = new Set();
    
    public addShells = (entryPoints: EntryPoint[]) => {
        entryPoints.forEach(this.attach);
    }

    private attach = (entryPoint: EntryPoint) => {
        const isAttached = this.attachedEntryPoints.has(entryPoint.name);
        if (!isAttached) {
            entryPoint.attach();
            this.attachedEntryPoints.add(entryPoint.name);
        } else {
            throw new Error(`entry point w/ name ${entryPoint.name} is already attahced`);
        }
    }
}


export const createAppHost = (entryPoints: EntryPoint[]): Host => {
    const host: Host = new HostImp();
    host.addShells(entryPoints);
    return host;
};