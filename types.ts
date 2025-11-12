
// Enums
export enum ProjectStatus {
    Active = 'active',
    OnHold = 'on-hold',
    Closed = 'closed',
}

export enum PlotSizeUnit {
    SqFt = 'sqft',
    SqYd = 'sqyd',
    Cent = 'cent',
}

export enum Facing {
    East = 'E',
    West = 'W',
    North = 'N',
    South = 'S',
    Any = 'Any'
}

export enum PlotStatus {
    Available = 'available',
    Hold = 'hold',
    Booked = 'booked',
    Sold = 'sold',
    Blocked = 'blocked',
}

export enum LeadSource {
    WalkIn = 'walk-in',
    Meta = 'Meta',
    Google = 'Google',
    Referral = 'Referral',
    Other = 'Other',
}

export enum LeadStatus {
    New = 'new',
    Working = 'working',
    Qualified = 'qualified',
    Hot = 'hot',
    Won = 'won',
    Lost = 'lost',
}

export enum ActivityType {
    Call = 'call',
    Visit = 'visit',
    SiteVisit = 'site-visit',
    Meeting = 'meeting',
    Whatsapp = 'whatsapp',
    Email = 'email',
}

export enum ActivityOutcome {
    Connected = 'connected',
    NoAnswer = 'no-answer',
    Interested = 'interested',
    NotInterested = 'not-interested',
    FollowUp = 'follow-up',
}

export enum BookingStatus {
    Hold = 'hold',
    BookingConfirmed = 'booking_confirmed',
    Cancelled = 'cancelled',
    Expired = 'expired',
}

export enum PaymentPlan {
    LumpSum = 'lumpsum',
    Linked = 'linked',
}

export enum PaymentStatus {
    Pending = 'pending',
    Partial = 'partial',
    Complete = 'complete',
}

export enum PaymentMethod {
    Cash = 'cash',
    UPI = 'upi',
    Card = 'card',
    NEFT = 'neft',
}

export enum EntityType {
    Lead = 'lead',
    Booking = 'booking',
    Plot = 'plot',
    Project = 'project',
}

export enum DocType {
    KYC = 'KYC',
    PAN = 'PAN',
    Aadhar = 'Aadhar',
    Agreement = 'Agreement',
    Registry = 'Registry',
    Layout = 'Layout',
}

export enum DocStatus {
    Pending = 'pending',
    Verified = 'verified',
    Rejected = 'rejected',
}

export enum UserRole {
    Owner = 'owner',
    Admin = 'admin',
    Director = 'director',
    PM = 'pm',
    Sales = 'sales',
    CRM = 'crm',
    Finance = 'finance',
    Legal = 'legal',
    Auditor = 'auditor',
}

// Interfaces
export interface Project {
    project_id: string;
    name: string;
    code: string;
    location_city: string;
    location_area: string;
    geo_lat: number;
    geo_lng: number;
    developer_name: string;
    launch_date: string; // ISO Date String
    status: ProjectStatus;
    default_plot_size_unit: PlotSizeUnit;
    base_rate: number;
    amenities: string[];
    inventory_count: number;
    created_by: string; // user_id
    created_at: string; // ISO DateTime String
    updated_at: string; // ISO DateTime String
}

export interface Plot {
    plot_id: string;
    project_id: string;
    block: string;
    phase: string;
    plot_no: string;
    size: number;
    size_unit: PlotSizeUnit;
    facing: Facing;
    corner: boolean;
    status: PlotStatus;
    base_rate: number;
    current_rate: number;
    min_rate: number;
    max_rate: number;
    hold_expiry_at: string | null; // ISO DateTime String
    booked_at: string | null; // ISO DateTime String
    last_status_change_at: string; // ISO DateTime String
    buyer_id: string | null; // lead_id
    sales_owner_id: string | null; // user_id
    coordinates: any | null; // JSON
    utilities: string[];
    tags: string[];
    notes: string;
}

export interface Lead {
    lead_id: string;
    source: LeadSource;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    city: string;
    project_interest_ids: string[]; // project_id
    budget_min: number;
    budget_max: number;
    plot_size_pref: number | null;
    facing_pref: Facing;
    status: LeadStatus;
    reason_lost: string;
    lead_score: number;
    assigned_to_user_id: string;
    duplicate_of: string | null; // lead_id
    last_contact_at: string; // ISO DateTime String
    next_followup_at: string; // ISO DateTime String
    tags: string[];
    consent_whatsapp: boolean;
    created_at: string; // ISO DateTime String
    updated_at: string; // ISO DateTime String
}

export interface Activity {
    activity_id: string;
    lead_id: string;
    user_id: string;
    type: ActivityType;
    summary: string;
    outcome: ActivityOutcome;
    next_action_at: string; // ISO DateTime String
    attachments: any[]; // file
    created_at: string; // ISO DateTime String
}

export interface Booking {
    booking_id: string;
    plot_id: string;
    lead_id: string;
    sales_user_id: string;
    status: BookingStatus;
    token_amount: number;
    token_due_at: string; // ISO DateTime String
    token_received_at: string | null; // ISO DateTime String
    agreement_value: number;
    discount_pct: number;
    approved_by: string | null; // user_id
    approval_note: string;
    payment_plan: PaymentPlan;
    payment_status: PaymentStatus;
    re_release_eligible_at: string; // ISO DateTime String
    cancellation_reason: string;
    cancellation_fee: number;
    created_at: string; // ISO DateTime String
    updated_at: string; // ISO DateTime String
}

export interface Payment {
    payment_id: string;
    booking_id: string;
    amount: number;
    method: PaymentMethod;
    txn_ref: string;
    received_at: string; // ISO DateTime String
    receipt_url: any; // file
    posted_by: string; // user_id
}

export interface Document {
    doc_id: string;
    entity_type: EntityType;
    entity_id: string;
    doc_type: DocType;
    url: any; // file
    uploaded_by: string; // user_id
    verified_by: string | null; // user_id
    verified_at: string | null; // ISO DateTime String
    status: DocStatus;
    remarks: string;
    created_at: string; // ISO DateTime String
}

export interface User {
    user_id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    reports_to_user_id: string | null;
    active: boolean;
}

export interface Settings {
    settings_id: string;
    default_hold_hours: number;
    auto_expire_hold: boolean;
    auto_reassign_dead_leads_days: number;
    whatsapp_api_key: string;
    email_smtp: any; // JSON
    maps_api_key: string;
    discount_approval_thresholds: any; // JSON
}
