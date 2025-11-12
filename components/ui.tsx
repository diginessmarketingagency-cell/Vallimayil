
import React, { Fragment, useRef, ReactNode } from 'react';
import { XMarkIcon } from './Icons';
import { PlotStatus, LeadStatus, ProjectStatus, BookingStatus } from '../types';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', fullWidth = false, className, children, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
    const variantClasses = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-800",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };
    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };
    const widthClass = fullWidth ? "w-full" : "";
    
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`} {...props}>
            {children}
        </button>
    );
};

// Modal
interface ModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    children: ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, setIsOpen, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};

// Drawer
interface DrawerProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    children: ReactNode;
    size?: 'default' | 'large' | 'xl';
}
export const Drawer: React.FC<DrawerProps> = ({ isOpen, setIsOpen, title, children, size = 'default' }) => {
    const sizeClasses = {
        default: 'max-w-md',
        large: 'max-w-2xl',
        xl: 'max-w-4xl'
    };
    
    return (
        <div className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`}>
            {/* Overlay */}
            <div className={`fixed inset-0 bg-black transition-opacity ${isOpen ? 'opacity-50' : 'opacity-0'}`} onClick={() => setIsOpen(false)}></div>
            
            {/* Panel */}
            <div className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-xl transform transition-transform ${sizeClasses[size]} w-full ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                       {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Badge
type StatusType = PlotStatus | LeadStatus | ProjectStatus | BookingStatus | string;
interface BadgeProps {
    status: StatusType;
    children: ReactNode;
}
export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
    const statusColors: Record<StatusType, string> = {
        // Plot Status
        [PlotStatus.Available]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [PlotStatus.Hold]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [PlotStatus.Booked]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [PlotStatus.Sold]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        [PlotStatus.Blocked]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        // Lead Status
        [LeadStatus.New]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
        [LeadStatus.Working]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
        [LeadStatus.Qualified]: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
        [LeadStatus.Hot]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [LeadStatus.Won]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [LeadStatus.Lost]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        // Project Status
        [ProjectStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [ProjectStatus.OnHold]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [ProjectStatus.Closed]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        // Booking Status
        // FIX: Removed duplicate key [BookingStatus.Hold] which has the same value 'hold' as [PlotStatus.Hold].
        [BookingStatus.BookingConfirmed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [BookingStatus.Cancelled]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [BookingStatus.Expired]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
            {children}
        </span>
    );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, ...props }, ref) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
        <input
            id={id}
            ref={ref}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            {...props}
        />
    </div>
));

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ label, id, children, ...props }, ref) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
        <select
            id={id}
            ref={ref}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...props}
        >
            {children}
        </select>
    </div>
));

// Tooltip
interface TooltipProps {
    content: string;
    children: ReactNode;
}
export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => (
    <div className="relative group">
        {children}
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {content}
        </div>
    </div>
);

// Card
interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}
export const Card: React.FC<CardProps> = ({ title, children, className, onClick }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden ${className}`} onClick={onClick}>
            {title && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                </div>
            )}
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};
