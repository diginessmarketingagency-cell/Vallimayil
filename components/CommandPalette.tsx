
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/mockApi';
import { Project, Plot, Lead, Booking } from '../types';
import { BuildingOffice2Icon, TableCellsIcon, UserGroupIcon, CurrencyDollarIcon, MagnifyingGlassIcon } from './Icons';

interface CommandPaletteProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setActiveView: (view: string) => void;
}

type SearchResult = (Project | Plot | Lead | Booking) & { entityType: string };

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, setIsOpen, setActiveView }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (query.length > 1) {
            // In a real app, this would be a single API call to an endpoint that searches across entities.
            const projects = api.getProjects().filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
            const plots = api.getPlots({}).filter(p => p.plot_no.toLowerCase().includes(query.toLowerCase()));
            const leads = api.getLeads({}).filter(l => `${l.first_name} ${l.last_name}`.toLowerCase().includes(query.toLowerCase()) || l.phone.includes(query));

            const combinedResults: SearchResult[] = [
                ...projects.map(p => ({ ...p, entityType: 'Project' })),
                ...plots.map(p => ({ ...p, entityType: 'Plot' })),
                ...leads.map(l => ({ ...l, entityType: 'Lead' })),
            ];
            setResults(combinedResults.slice(0, 10)); // Limit to 10 results
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        switch (result.entityType) {
            case 'Project':
                setActiveView('Projects');
                break;
            case 'Plot':
                setActiveView('Inventory');
                break;
            case 'Lead':
                setActiveView('Leads');
                break;
        }
        // In a real app, you'd also pass the selected entity ID to the view to open its drawer.
        setIsOpen(false);
    };

    if (!isOpen) return null;
    
    const getResultTitle = (result: SearchResult) => {
        switch(result.entityType) {
            case 'Project': return (result as Project).name;
            case 'Plot': return `Plot #${(result as Plot).plot_no}`;
            case 'Lead': return `${(result as Lead).first_name} ${(result as Lead).last_name}`;
            default: return 'Unknown';
        }
    }
    
    const getResultIcon = (entityType: string) => {
        switch(entityType) {
            case 'Project': return <BuildingOffice2Icon className="w-5 h-5 text-gray-400"/>;
            case 'Plot': return <TableCellsIcon className="w-5 h-5 text-gray-400"/>;
            case 'Lead': return <UserGroupIcon className="w-5 h-5 text-gray-400"/>;
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16" onClick={() => setIsOpen(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search projects, plots, leads..."
                        className="w-full bg-transparent focus:outline-none text-gray-900 dark:text-gray-100"
                    />
                </div>
                <ul className="max-h-96 overflow-y-auto">
                    {results.length > 0 ? results.map((result, index) => (
                        <li key={`${result.entityType}-${index}`} 
                            onClick={() => handleSelect(result)}
                            className="p-4 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                            {getResultIcon(result.entityType)}
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{getResultTitle(result)}</p>
                                <p className="text-sm text-gray-500">{result.entityType}</p>
                            </div>
                        </li>
                    )) : (
                        <li className="p-6 text-center text-gray-500">
                            {query.length > 1 ? 'No results found.' : 'Start typing to search.'}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};
