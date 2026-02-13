"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, Settings, Activity, Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AlertToast from '@/components/alerts/AlertToast';
import AlertCenter from '@/components/alerts/AlertCenter';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const sidebarItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sensor Inventory', href: '/inventory', icon: Database },
    { name: 'Status Monitoring', href: '/monitoring', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-[#050505] text-slate-200">
            <AlertToast />

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800/50 bg-[#0a0a0a]/80 backdrop-blur-xl">
                <div className="flex h-full flex-col px-4 py-6">
                    <div className="mb-10 flex items-center gap-3 px-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                            <Activity size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">GUARDION</span>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 group",
                                        isActive
                                            ? "bg-orange-500/10 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                    )}
                                >
                                    <Icon size={20} className={cn("transition-colors", isActive ? "text-orange-500" : "text-slate-400 group-hover:text-white")} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto rounded-2xl bg-gradient-to-br from-slate-900 to-black p-4 border border-slate-800/50">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-semibold text-white">All Systems Nominal</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-64 flex-1 flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/50 bg-[#050505]/60 px-8 backdrop-blur-md">
                    <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-xl w-96">
                        <Search size={16} className="text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search sensors, logs, or alerts..."
                            className="bg-transparent border-none text-sm focus:ring-0 text-slate-300 w-full placeholder:text-slate-600"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <AlertCenter />
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-300 border border-white/20 shadow-lg" />
                    </div>
                </header>

                <main className="p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
