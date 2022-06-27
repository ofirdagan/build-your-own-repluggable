import React, {useState} from 'react';
import {Host} from './repluggable';
import {HostState} from './host-reducer';

interface AppMainViewProps {
    host: Host
}

export const AppMainView: React.FC<AppMainViewProps> = ({host}: AppMainViewProps) => {
    const [views, setViews] = useState<React.ReactNode[]>([]);
    host.getHostStore<HostState>().subscribe(() => {
        const views = host.getHostStore<any>().getState().host.views;
        setViews(views);
    });

    return (
        <>
            <div>Hello App Main View</div>
            {views.map((view, i) => <div key={i}>{view}</div>)}
        </>
    )
}
