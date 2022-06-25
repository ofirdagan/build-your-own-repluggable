

export interface EntryPoint {
    name: string;
    attach(): void
}

const attchedEntryPoints: Set<string> = new Set();

export const createAppHost = (entryPoints: EntryPoint[]) => {
    entryPoints.forEach(entryPoint => {
        const isAttached = attchedEntryPoints.has(entryPoint.name);
        if (!isAttached) {
            entryPoint.attach();
            attchedEntryPoints.add(entryPoint.name);
        } else {
            throw new Error(`entry point w/ name ${entryPoint.name} is already attahced`);
        }
    });
};