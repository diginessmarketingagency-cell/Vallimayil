
import {
    Project, Plot, Lead, Activity, Booking, Payment, Document, User, Settings,
    ProjectStatus, PlotSizeUnit, Facing, PlotStatus, LeadSource, LeadStatus,
    ActivityType, ActivityOutcome, BookingStatus, PaymentPlan, PaymentStatus, PaymentMethod,
    EntityType, DocType, DocStatus, UserRole
} from '../types';

// A mock uuid function is used instead of the library for simplicity in this environment.
const uuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// --- SEED DATA ---
let users: User[] = [];
let projects: Project[] = [];
let plots: Plot[] = [];
let leads: Lead[] = [];
let activities: Activity[] = [];
let bookings: Booking[] = [];
let payments: Payment[] = [];
let documents: Document[] = [];
let settings: Settings;

const generateSeedData = () => {
    // Users
    const owner: User = { user_id: 'user_owner_1', name: 'Alice Owner', email: 'owner@plots.erp', phone: '1111111111', role: UserRole.Owner, reports_to_user_id: null, active: true };
    const admin: User = { user_id: 'user_admin_1', name: 'Bob Admin', email: 'admin@plots.erp', phone: '2222222222', role: UserRole.Admin, reports_to_user_id: owner.user_id, active: true };
    const director: User = { user_id: 'user_director_1', name: 'Charlie Director', email: 'director@plots.erp', phone: '3333333333', role: UserRole.Director, reports_to_user_id: owner.user_id, active: true };
    const pm: User = { user_id: 'user_pm_1', name: 'Diana PM', email: 'pm@plots.erp', phone: '4444444444', role: UserRole.PM, reports_to_user_id: director.user_id, active: true };
    const sales1: User = { user_id: 'user_sales_1', name: 'Ethan Sales', email: 'sales1@plots.erp', phone: '5555555555', role: UserRole.Sales, reports_to_user_id: pm.user_id, active: true };
    const sales2: User = { user_id: 'user_sales_2', name: 'Fiona Sales', email: 'sales2@plots.erp', phone: '6666666666', role: UserRole.Sales, reports_to_user_id: pm.user_id, active: true };
    const crm: User = { user_id: 'user_crm_1', name: 'George CRM', email: 'crm@plots.erp', phone: '7777777777', role: UserRole.CRM, reports_to_user_id: pm.user_id, active: true };
    const finance: User = { user_id: 'user_finance_1', name: 'Hannah Finance', email: 'finance@plots.erp', phone: '8888888888', role: UserRole.Finance, reports_to_user_id: director.user_id, active: true };
    const legal: User = { user_id: 'user_legal_1', name: 'Ian Legal', email: 'legal@plots.erp', phone: '9999999999', role: UserRole.Legal, reports_to_user_id: director.user_id, active: true };
    const auditor: User = { user_id: 'user_auditor_1', name: 'Judy Auditor', email: 'auditor@plots.erp', phone: '1010101010', role: UserRole.Auditor, reports_to_user_id: null, active: true };
    users = [owner, admin, director, pm, sales1, sales2, crm, finance, legal, auditor];

    // Settings
    settings = {
        settings_id: 'settings_1',
        default_hold_hours: 48,
        auto_expire_hold: true,
        auto_reassign_dead_leads_days: 14,
        whatsapp_api_key: 'WHATSAPP_API_KEY_SECRET',
        email_smtp: {},
        maps_api_key: 'MAPS_API_KEY_SECRET',
        discount_approval_thresholds: { "sales": 5, "pm": 10 }
    };

    // Projects & Plots
    const cities = ['Vellore', 'Chennai', 'Bengaluru'];
    const projectNames = ['Green Valley', 'Sunrise Meadows', 'Royal Palms', 'Orchid Gardens', 'Lakeside Estates', 'Hillview Residency'];
    projectNames.forEach((name, i) => {
        const city = cities[i % cities.length];
        const project: Project = {
            project_id: `proj_${i + 1}`,
            name: name,
            code: name.replace(/\s+/g, '').toUpperCase().substring(0, 5),
            location_city: city,
            location_area: `${city} Suburb ${i + 1}`,
            geo_lat: 12.9 + Math.random() * 0.1,
            geo_lng: 79.1 + Math.random() * 0.1,
            developer_name: 'Plots Inc.',
            launch_date: new Date(2022 + Math.floor(i / 2), i % 12, 1).toISOString(),
            status: ProjectStatus.Active,
            default_plot_size_unit: PlotSizeUnit.SqFt,
            base_rate: 1000 + Math.floor(Math.random() * 1000),
            amenities: ['Clubhouse', 'Swimming Pool', 'Park'],
            inventory_count: 0,
            created_by: admin.user_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        projects.push(project);

        // Plots for this project (150 each)
        for (let j = 0; j < 150; j++) {
            const status = j < 100 ? PlotStatus.Available : j < 120 ? PlotStatus.Hold : j < 140 ? PlotStatus.Booked : PlotStatus.Sold;
            const size = 1200 + Math.floor(Math.random() * 2800);
            const rate = project.base_rate + Math.floor(Math.random() * 500) - 250;
            const plot: Plot = {
                plot_id: `plot_${i + 1}_${j + 1}`,
                project_id: project.project_id,
                block: ['A', 'B', 'C'][j % 3],
                phase: '1',
                plot_no: `${['A', 'B', 'C'][j % 3]}-${j + 1}`,
                size: size,
                size_unit: PlotSizeUnit.SqFt,
                facing: [Facing.East, Facing.West, Facing.North, Facing.South][j % 4],
                corner: j % 10 === 0,
                status: status,
                base_rate: rate,
                current_rate: rate * 1.1,
                min_rate: rate * 0.95,
                max_rate: rate * 1.5,
                hold_expiry_at: status === PlotStatus.Hold ? new Date(Date.now() + (j % 5 - 2) * 24 * 3600 * 1000).toISOString() : null,
                booked_at: status === PlotStatus.Booked ? new Date().toISOString() : null,
                last_status_change_at: new Date().toISOString(),
                buyer_id: null,
                sales_owner_id: [sales1.user_id, sales2.user_id][j % 2],
                coordinates: null,
                utilities: ['Water', 'Electricity'],
                tags: j % 7 === 0 ? ['Premium'] : [],
                notes: ''
            };
            plots.push(plot);
        }
    });

    // Update inventory counts
    projects.forEach(p => {
        p.inventory_count = plots.filter(plot => plot.project_id === p.project_id).length;
    });

    // Leads & Activities
    for (let i = 0; i < 200; i++) {
        const lead: Lead = {
            lead_id: `lead_${i + 1}`,
            source: Object.values(LeadSource)[i % Object.values(LeadSource).length],
            first_name: `LeadFirst${i + 1}`,
            last_name: `LeadLast${i + 1}`,
            phone: `98765432${i.toString().padStart(2, '0')}`,
            email: `lead${i + 1}@example.com`,
            city: cities[i % cities.length],
            project_interest_ids: [projects[i % projects.length].project_id],
            budget_min: 2000000 + (Math.random() * 1000000),
            budget_max: 3000000 + (Math.random() * 2000000),
            plot_size_pref: 2400,
            facing_pref: Facing.Any,
            status: Object.values(LeadStatus)[i % Object.values(LeadStatus).length],
            reason_lost: '',
            lead_score: 50 + Math.floor(Math.random() * 50) - 25,
            assigned_to_user_id: [sales1.user_id, sales2.user_id][i % 2],
            duplicate_of: null,
            last_contact_at: new Date().toISOString(),
            next_followup_at: new Date(Date.now() + (i % 10) * 24 * 3600 * 1000).toISOString(),
            tags: [],
            consent_whatsapp: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        leads.push(lead);

        if (i < 60) {
            const activity: Activity = {
                activity_id: `act_${i + 1}`,
                lead_id: lead.lead_id,
                user_id: lead.assigned_to_user_id,
                type: ActivityType.Call,
                summary: 'Initial discussion, client is interested.',
                outcome: ActivityOutcome.Interested,
                next_action_at: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
                attachments: [],
                created_at: new Date().toISOString(),
            };
            activities.push(activity);
        }
    }
    
    // Bookings
    const bookedPlots = plots.filter(p => p.status === PlotStatus.Booked || p.status === PlotStatus.Hold);
    bookedPlots.forEach((plot, i) => {
        const lead = leads[i];
        if (!lead) return;
        
        plot.buyer_id = lead.lead_id;
        
        const booking: Booking = {
            booking_id: `book_${plot.plot_id}`,
            plot_id: plot.plot_id,
            lead_id: lead.lead_id,
            sales_user_id: plot.sales_owner_id!,
            status: plot.status === PlotStatus.Hold ? BookingStatus.Hold : BookingStatus.BookingConfirmed,
            token_amount: 50000,
            token_due_at: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
            token_received_at: plot.status === PlotStatus.Hold ? null : new Date().toISOString(),
            agreement_value: plot.current_rate * plot.size,
            discount_pct: 0,
            approved_by: null,
            approval_note: '',
            payment_plan: PaymentPlan.Linked,
            payment_status: PaymentStatus.Pending,
            re_release_eligible_at: '',
            cancellation_reason: '',
            cancellation_fee: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        bookings.push(booking);
    });

};

// --- PERMISSIONS ---
export enum Permission {
    ReadOnly,
    SettingsCRUD,
    HoldPlot,
    BookPlot,
    ReReleasePlot,
    EditRates,
    VerifyDocs,
    DeleteEntity,
}

// FIX: Replaced complex Object.values logic with a simple, explicit array to prevent silent runtime errors.
const allPermissions: Permission[] = [
    Permission.ReadOnly,
    Permission.SettingsCRUD,
    Permission.HoldPlot,
    Permission.BookPlot,
    Permission.ReReleasePlot,
    Permission.EditRates,
    Permission.VerifyDocs,
    Permission.DeleteEntity,
];

const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.Owner]: allPermissions,
    [UserRole.Admin]: allPermissions,
    [UserRole.Director]: [Permission.ReadOnly, Permission.ReReleasePlot, Permission.BookPlot, Permission.HoldPlot, Permission.VerifyDocs],
    [UserRole.PM]: [Permission.ReadOnly, Permission.ReReleasePlot, Permission.BookPlot, Permission.HoldPlot, Permission.VerifyDocs],
    [UserRole.Sales]: [Permission.ReadOnly, Permission.HoldPlot, Permission.BookPlot],
    [UserRole.CRM]: [Permission.ReadOnly, Permission.HoldPlot, Permission.BookPlot],
    [UserRole.Finance]: [Permission.ReadOnly],
    [UserRole.Legal]: [Permission.ReadOnly, Permission.VerifyDocs],
    [UserRole.Auditor]: [Permission.ReadOnly],
};

export const checkPermission = (role: UserRole, permission: Permission, options?: any): boolean => {
    return rolePermissions[role].includes(permission);
}

// --- API ---
class MockApi {
    constructor() {
        generateSeedData();
    }

    getUsers = (): User[] => users;
    getUserById = (id: string | null | undefined): User | undefined => users.find(u => u.user_id === id);
    
    getProjects = (): Project[] => projects;
    getProjectById = (id: string): Project | undefined => projects.find(p => p.project_id === id);
    
    getPlots = (filters: any): Plot[] => plots; // Simplified filter
    getPlotById = (id: string): Plot | undefined => plots.find(p => p.plot_id === id);

    getLeads = (filters: any): Lead[] => leads;
    getLeadById = (id: string): Lead | undefined => leads.find(l => l.lead_id === id);

    getBookings = (filters: any): Booking[] => bookings;
    
    getActivitiesForLead = (leadId: string): Activity[] => activities.filter(a => a.lead_id === leadId);

    // --- Business Logic & Automations ---
    holdPlot = async (user: User, plotId: string, leadId: string): Promise<Booking> => {
        if (!checkPermission(user.role, Permission.HoldPlot)) throw new Error("Permission denied.");

        const plot = this.getPlotById(plotId);
        if (!plot || plot.status !== PlotStatus.Available) throw new Error("Plot is not available for hold.");
        
        const lead = this.getLeadById(leadId);
        if (!lead) throw new Error("Lead not found.");

        const now = new Date();
        const expiry = new Date(now.getTime() + settings.default_hold_hours * 3600 * 1000);

        plot.status = PlotStatus.Hold;
        plot.hold_expiry_at = expiry.toISOString();
        plot.buyer_id = leadId;
        plot.sales_owner_id = user.role === UserRole.Sales || user.role === UserRole.CRM ? user.user_id : lead.assigned_to_user_id;
        plot.last_status_change_at = now.toISOString();

        const booking: Booking = {
            booking_id: `book_${uuid()}`,
            plot_id: plot.plot_id,
            lead_id: lead.lead_id,
            sales_user_id: plot.sales_owner_id!,
            status: BookingStatus.Hold,
            token_amount: 50000,
            token_due_at: expiry.toISOString(),
            token_received_at: null,
            agreement_value: plot.current_rate * plot.size,
            discount_pct: 0,
            approved_by: null,
            approval_note: '',
            payment_plan: PaymentPlan.Linked,
            payment_status: PaymentStatus.Pending,
            re_release_eligible_at: '',
            cancellation_reason: '',
            cancellation_fee: 0,
            created_at: now.toISOString(),
            updated_at: now.toISOString()
        };
        bookings.push(booking);
        
        // Mock Automation: Send notifications
        console.log(`AUTOMATION: Sent WhatsApp/SMS to ${lead.phone} for token payment for plot ${plot.plot_no}.`);

        return booking;
    };
    
    autoExpireHolds = async (): Promise<Plot[]> => {
        const now = new Date();
        const expiredPlots: Plot[] = [];
        
        const holdsToExpire = bookings.filter(b => 
            b.status === BookingStatus.Hold &&
            new Date(b.token_due_at) < now &&
            !b.token_received_at
        );
        
        holdsToExpire.forEach(booking => {
            const plot = this.getPlotById(booking.plot_id);
            if (plot) {
                plot.status = PlotStatus.Available;
                plot.hold_expiry_at = null;
                plot.buyer_id = null;
                plot.last_status_change_at = now.toISOString();
                
                booking.status = BookingStatus.Expired;
                booking.updated_at = now.toISOString();
                
                expiredPlots.push(plot);
                
                // Mock Automation: Notify team
                const salesUser = this.getUserById(booking.sales_user_id);
                console.log(`AUTOMATION: Hold expired for Plot ${plot.plot_no}. Notified ${salesUser?.name} and PM.`);
            }
        });
        
        return expiredPlots;
    };
}

export const api = new MockApi();
