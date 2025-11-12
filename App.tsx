
import React, { useState, useEffect, useCallback, createContext, useContext, useMemo, useRef } from 'react';
import { Project, Plot, Lead, Booking, Activity, User, UserRole, PlotStatus, LeadStatus, BookingStatus } from './types';
import { api, checkPermission, Permission } from './services/mockApi';
import { CommandPalette } from './components/CommandPalette';
import { Button, Modal, Drawer, Badge, Input, Select, Tooltip, Card } from './components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
    HomeIcon, BuildingOffice2Icon, TableCellsIcon, UserGroupIcon, CurrencyDollarIcon, DocumentCheckIcon, 
    ChartBarIcon, Cog6ToothIcon, SunIcon, MoonIcon, MapIcon, MagnifyingGlassIcon, XMarkIcon, PlusIcon,
    ChevronDownIcon, ChevronUpIcon, PencilIcon, EyeIcon, ArrowUpRightIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftIcon
} from './components/Icons';
import { aiService } from './services/aiService';


// Authentication Context
interface AuthContextType {
    currentUser: User | null;
    setCurrentUser: (user: User) => void;
    users: User[];
    hasPermission: (permission: Permission, options?: any) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Main App Component
const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState('Dashboard');
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [isDarkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const allUsers = api.getUsers();
        setUsers(allUsers);
        setCurrentUser(allUsers.find(u => u.role === UserRole.Owner) || allUsers[0]);
        
        const interval = setInterval(() => {
            api.autoExpireHolds().then(expired => {
                if (expired.length > 0) {
                    console.log(`Auto-expired ${expired.length} holds.`);
                    // Here you would trigger a toast notification
                }
            });
        }, 15 * 1000); // Check every 15 seconds for demo purposes

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandPaletteOpen(open => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);
    
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const hasPermission = useCallback((permission: Permission, options?: any): boolean => {
        if (!currentUser) return false;
        return checkPermission(currentUser.role, permission, options);
    }, [currentUser]);

    const authContextValue = useMemo(() => ({
        currentUser,
        setCurrentUser,
        users,
        hasPermission
    }), [currentUser, users, hasPermission]);

    if (!currentUser) {
        return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading...</div>;
    }

    const navigationItems = [
        { name: 'Dashboard', icon: ChartBarIcon, permission: Permission.ReadOnly },
        { name: 'Projects', icon: BuildingOffice2Icon, permission: Permission.ReadOnly },
        { name: 'Inventory', icon: TableCellsIcon, permission: Permission.ReadOnly },
        { name: 'Leads', icon: UserGroupIcon, permission: Permission.ReadOnly },
        { name: 'Bookings', icon: CurrencyDollarIcon, permission: Permission.ReadOnly },
        { name: 'Documents', icon: DocumentCheckIcon, permission: Permission.ReadOnly },
        { name: 'Settings', icon: Cog6ToothIcon, permission: Permission.SettingsCRUD }
    ];

    return (
        <AuthContext.Provider value={authContextValue}>
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setCommandPaletteOpen} setActiveView={setActiveView}/>
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
                        <HomeIcon className="h-8 w-8 text-primary-600" />
                        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-100">Plots ERP</span>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul>
                            {navigationItems.map(item => (
                                hasPermission(item.permission) && (
                                    <li key={item.name}>
                                        <a href="#" onClick={() => setActiveView(item.name)} className={`flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors ${activeView === item.name ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                            <item.icon className="h-5 w-5 mr-3" />
                                            {item.name}
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    </nav>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                         <div className="text-sm">Dark Mode</div>
                         <button onClick={() => setDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                           {isDarkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
                         </button>
                       </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{activeView}</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" onClick={() => setCommandPaletteOpen(true)} className="flex items-center space-x-2">
                                <MagnifyingGlassIcon className="h-5 w-5"/>
                                <span>Search...</span>
                                <kbd className="ml-4 px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">⌘K</kbd>
                            </Button>
                            <div className="flex items-center">
                                <Select value={currentUser.user_id} onChange={(e) => setCurrentUser(users.find(u => u.user_id === e.target.value) || currentUser)}>
                                    {users.map(user => <option key={user.user_id} value={user.user_id}>{user.name} ({user.role})</option>)}
                                </Select>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                        {activeView === 'Dashboard' && <DashboardView />}
                        {activeView === 'Projects' && <ProjectsView />}
                        {activeView === 'Inventory' && <InventoryView />}
                        {activeView === 'Leads' && <LeadsView />}
                        {activeView === 'Bookings' && <BookingsView />}
                        {/* Add other views */}
                    </main>
                </div>
            </div>
        </AuthContext.Provider>
    );
};

// Placeholder Views (to be replaced with actual implementations)
const DashboardView = () => {
    const { hasPermission } = useAuth();
    if (!hasPermission(Permission.ReadOnly)) return <div className="text-red-500">You do not have permission to view this page.</div>;

    const funnelData = [
        { name: 'New Leads', value: 120 },
        { name: 'Working', value: 90 },
        { name: 'Qualified', value: 65 },
        { name: 'Hot', value: 30 },
        { name: 'Won', value: 15 },
    ];

    const sourceData = [
        { name: 'Meta', value: 400 },
        { name: 'Google', value: 300 },
        { name: 'Referral', value: 200 },
        { name: 'Walk-in', value: 100 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const projects = api.getProjects();
    const plots = api.getPlots({});
    
    const kpis = {
      totalProjects: projects.length,
      totalPlots: plots.length,
      availablePlots: plots.filter(p => p.status === PlotStatus.Available).length,
      avgRate: plots.reduce((acc, p) => acc + p.current_rate, 0) / plots.length,
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Total Projects">
                <p className="text-3xl font-bold">{kpis.totalProjects}</p>
            </Card>
            <Card title="Total Plots">
                <p className="text-3xl font-bold">{kpis.totalPlots}</p>
            </Card>
            <Card title="Available Plots">
                <p className="text-3xl font-bold">{kpis.availablePlots}</p>
            </Card>
            <Card title="Avg. Rate / sqft">
                <p className="text-3xl font-bold">${kpis.avgRate.toFixed(2)}</p>
            </Card>
            
            <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Sales Funnel</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Leads by Source</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
        </div>
    );
};
const ProjectsView = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    useEffect(() => {
        setProjects(api.getProjects());
    }, []);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map(project => (
                    <Card key={project.project_id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedProject(project)}>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-primary-600 dark:text-primary-400">{project.name}</h3>
                            <p className="text-sm text-gray-500">{project.location_city}, {project.location_area}</p>
                            <div className="mt-4 flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold">{project.inventory_count}</p>
                                    <p className="text-gray-500">Plots</p>
                                </div>
                                <div>
                                    <p className="font-semibold">${project.base_rate.toLocaleString()}</p>
                                    <p className="text-gray-500">Base Rate</p>
                                </div>
                                <div>
                                    <Badge status={project.status}>{project.status}</Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Drawer isOpen={!!selectedProject} setIsOpen={() => setSelectedProject(null)} title={selectedProject?.name || ''}>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Project Overview</h3>
                    <p>Details for {selectedProject?.name} would be displayed here.</p>
                </div>
            </Drawer>
        </div>
    );
};
const InventoryView = () => {
    const { hasPermission } = useAuth();
    const [plots, setPlots] = useState<Plot[]>([]);
    const [filters, setFilters] = useState({});
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const [isHoldModalOpen, setHoldModalOpen] = useState(false);

    useEffect(() => {
        setPlots(api.getPlots(filters));
    }, [filters]);
    
    const handleHoldPlot = () => {
        if (selectedPlot && hasPermission(Permission.HoldPlot)) {
            setHoldModalOpen(true);
        } else {
            alert("You don't have permission to hold plots.");
        }
    }

    const HoldModalContent: React.FC<{ plot: Plot, onClose: () => void }> = ({ plot, onClose }) => {
        const { currentUser } = useAuth();
        const [leadId, setLeadId] = useState('');

        const handleConfirmHold = async () => {
            if (!currentUser || !leadId) {
                alert("Please select a lead.");
                return;
            }
            try {
                await api.holdPlot(currentUser, plot.plot_id, leadId);
                alert(`Plot ${plot.plot_no} held successfully!`);
                onClose();
                setPlots(api.getPlots(filters)); // Refresh plot list
                setSelectedPlot(null);
            } catch (error: any) {
                alert(`Error: ${error.message}`);
            }
        };

        return (
            <div>
                <h3 className="text-lg font-bold mb-4">Hold Plot: {plot.plot_no}</h3>
                <div className="space-y-4">
                    <Input label="Search Lead" value={leadId} onChange={(e) => setLeadId(e.target.value)} placeholder="Enter Lead ID"/>
                    {/* A proper implementation would have a lead search component */}
                    <p className="text-sm">Default hold time: 48 hours.</p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleConfirmHold}>Confirm Hold</Button>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="h-full flex flex-col">
            {/* Filters would go here */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
                <p>Filters: Project, Status, Facing, Size, Price etc.</p>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Plot No</th>
                            <th scope="col" className="px-6 py-3">Project</th>
                            <th scope="col" className="px-6 py-3">Size</th>
                            <th scope="col" className="px-6 py-3">Facing</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Rate</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plots.map(plot => (
                            <tr key={plot.plot_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{plot.plot_no}</td>
                                <td className="px-6 py-4">{api.getProjectById(plot.project_id)?.name}</td>
                                <td className="px-6 py-4">{plot.size} {plot.size_unit}</td>
                                <td className="px-6 py-4">{plot.facing}</td>
                                <td className="px-6 py-4"><Badge status={plot.status}>{plot.status}</Badge></td>
                                <td className="px-6 py-4">${plot.current_rate.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <Button size="sm" onClick={() => setSelectedPlot(plot)}>Details</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Drawer isOpen={!!selectedPlot} setIsOpen={() => setSelectedPlot(null)} title={`Plot ${selectedPlot?.plot_no}`}>
                {selectedPlot && (
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Plot Details</h3>
                        <p><strong>Status:</strong> <Badge status={selectedPlot.status}>{selectedPlot.status}</Badge></p>
                        <p><strong>Size:</strong> {selectedPlot.size} {selectedPlot.size_unit}</p>
                        <p><strong>Current Rate:</strong> ${selectedPlot.current_rate.toLocaleString()}</p>
                        <div className="mt-6 flex space-x-2">
                            {selectedPlot.status === PlotStatus.Available && hasPermission(Permission.HoldPlot) && (
                                <Button onClick={handleHoldPlot}>Hold</Button>
                            )}
                            {hasPermission(Permission.BookPlot) && <Button disabled>Book</Button>}
                            {hasPermission(Permission.ReReleasePlot) && <Button variant="danger" disabled>Re-release</Button>}
                        </div>
                    </div>
                )}
            </Drawer>
            
            {selectedPlot && isHoldModalOpen && (
                <Modal isOpen={isHoldModalOpen} setIsOpen={setHoldModalOpen} title="">
                    <HoldModalContent plot={selectedPlot} onClose={() => setHoldModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};
const LeadsView = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    useEffect(() => {
        setLeads(api.getLeads({}));
    }, []);

    const LeadDrawerContent: React.FC<{ lead: Lead }> = ({ lead }) => {
        const [summary, setSummary] = useState('');
        const [nextSteps, setNextSteps] = useState('');
        const [suggestedPlots, setSuggestedPlots] = useState('');
        const [isLoading, setIsLoading] = useState<string | null>(null);
        
        const handleAiAction = async (action: 'summarize' | 'steps' | 'plots') => {
            setIsLoading(action);
            try {
                const activities = api.getActivitiesForLead(lead.lead_id);
                if (action === 'summarize') {
                    const res = await aiService.summarizeActivities(activities);
                    setSummary(res);
                } else if (action === 'steps') {
                    const res = await aiService.suggestNextSteps(lead, activities);
                    setNextSteps(res);
                } else if (action === 'plots') {
                    const res = await aiService.suggestPlots(lead);
                    setSuggestedPlots(res);
                }
            } catch (error) {
                console.error("AI service error:", error);
                alert("Failed to get AI suggestion.");
            } finally {
                setIsLoading(null);
            }
        };

        return (
            <div className="p-6 grid grid-cols-3 gap-6 h-full">
                <div className="col-span-1 border-r pr-6 dark:border-gray-700">
                    <h3 className="text-xl font-bold">{lead.first_name} {lead.last_name}</h3>
                    <p className="text-sm text-gray-500">{lead.status}</p>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center"><EnvelopeIcon className="w-4 h-4 mr-2"/> {lead.email}</div>
                        <div className="flex items-center"><PhoneIcon className="w-4 h-4 mr-2"/> {lead.phone}</div>
                        <div className="flex items-center"><UserGroupIcon className="w-4 h-4 mr-2"/> Assigned to: {api.getUserById(lead.assigned_to_user_id)?.name}</div>
                    </div>
                </div>
                <div className="col-span-1">
                    <h4 className="font-semibold mb-2">Timeline</h4>
                    {/* Timeline would go here */}
                    <div className="text-sm text-gray-500">Activity timeline...</div>
                </div>
                <div className="col-span-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-4">AI Assistant</h4>
                    <div className="space-y-2">
                        <Button size="sm" fullWidth onClick={() => handleAiAction('summarize')} disabled={!!isLoading}>
                            {isLoading === 'summarize' ? 'Summarizing...' : 'Summarize Latest Calls'}
                        </Button>
                        <Button size="sm" fullWidth onClick={() => handleAiAction('steps')} disabled={!!isLoading}>
                            {isLoading === 'steps' ? 'Thinking...' : 'Suggest Next Steps'}
                        </Button>
                        <Button size="sm" fullWidth onClick={() => handleAiAction('plots')} disabled={!!isLoading}>
                            {isLoading === 'plots' ? 'Searching...' : 'Suggest Plots'}
                        </Button>
                    </div>
                    <div className="mt-4 space-y-4 text-sm">
                        {summary && <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded"><strong>Summary:</strong> {summary}</div>}
                        {nextSteps && <div className="p-2 bg-green-50 dark:bg-green-900/50 rounded"><strong>Next Steps:</strong> {nextSteps}</div>}
                        {suggestedPlots && <div className="p-2 bg-purple-50 dark:bg-purple-900/50 rounded"><strong>Suggested Plots:</strong> {suggestedPlots}</div>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Phone</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Score</th>
                        <th scope="col" className="px-6 py-3">Assigned To</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map(lead => (
                        <tr key={lead.lead_id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{lead.first_name} {lead.last_name}</td>
                            <td className="px-6 py-4">{lead.phone}</td>
                            <td className="px-6 py-4"><Badge status={lead.status}>{lead.status}</Badge></td>
                            <td className="px-6 py-4">{lead.lead_score}</td>
                            <td className="px-6 py-4">{api.getUserById(lead.assigned_to_user_id)?.name}</td>
                            <td className="px-6 py-4">
                                <Button size="sm" onClick={() => setSelectedLead(lead)}>Details</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <Drawer isOpen={!!selectedLead} setIsOpen={() => setSelectedLead(null)} title="Lead Details" size="large">
                {selectedLead && <LeadDrawerContent lead={selectedLead} />}
            </Drawer>
        </div>
    );
};
const BookingsView = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        setBookings(api.getBookings({}));
    }, []);

    const bookingColumns: { [key in BookingStatus]: Booking[] } = {
        [BookingStatus.Hold]: [],
        [BookingStatus.BookingConfirmed]: [],
        [BookingStatus.Cancelled]: [],
        [BookingStatus.Expired]: [],
    };

    bookings.forEach(booking => {
        if (bookingColumns[booking.status]) {
            bookingColumns[booking.status].push(booking);
        }
    });

    return (
        <div className="flex space-x-4 overflow-x-auto p-2">
            {Object.entries(bookingColumns).map(([status, bookingsInStatus]) => (
                <div key={status} className="w-80 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="p-4 font-semibold border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">
                        {status} <span className="text-sm font-normal text-gray-500">({bookingsInStatus.length})</span>
                    </div>
                    <div className="p-2 space-y-2 h-[calc(100vh-200px)] overflow-y-auto">
                        {bookingsInStatus.map(booking => (
                            <div key={booking.booking_id} className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow">
                                <p className="font-semibold">Plot #{api.getPlotById(booking.plot_id)?.plot_no}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{api.getLeadById(booking.lead_id)?.first_name}</p>
                                <p className="text-xs text-gray-500 mt-2">Token due: {new Date(booking.token_due_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default App;
