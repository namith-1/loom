"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/store/useDashboardStore';

type NavItem = {
  name: string;
  href: string;
  isNew?: boolean;
  hasExternal?: boolean;
};

const myProducts: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'AI', href: '#', isNew: true, hasExternal: true },
  { name: 'Meetings', href: '#' },
  { name: 'Recordings', href: '#' },
  { name: 'Summaries', href: '#' },
  { name: 'Hub', href: '#', isNew: true, hasExternal: true },
  { name: 'Whiteboards', href: '#' },
  { name: 'Notes', href: '#' },
  { name: 'Clips', href: '#', hasExternal: true },
  { name: 'Canvas', href: '#', hasExternal: true },
  { name: 'Paper', href: '#', hasExternal: true },
  { name: 'Sheets', href: '#', hasExternal: true },
  { name: 'Slides', href: '#', hasExternal: true },
  { name: 'Tasks', href: '#' },
];

const myAccount: NavItem[] = [
  { name: 'Profile', href: '/profile' },
  { name: 'Settings', href: '#' },
  { name: 'Personal Devices', href: '#' },
  { name: 'Personal Contacts', href: '#' },
  { name: 'Data & Privacy', href: '#' },
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useDashboardStore();
  const [activeItem, setActiveItem] = useState('Home');
  const [isAccountOpen, setIsAccountOpen] = useState(true);

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-40 w-64 flex-shrink-0 border-r border-gray-200 bg-[#FAFAFC] overflow-y-auto flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        // On desktop, we want it to take height from parent flex layout, on mobile full height
        "h-full md:h-[calc(100vh-3.5rem)]"
      )}>
        <div className="py-4">
        {/* My Products Section */}
        <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          My Products
        </div>
        <nav className="space-y-1">
          {myProducts.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setActiveItem(item.name)}
              className={cn(
                "group flex items-center justify-between px-4 py-2 text-sm font-medium",
                activeItem === item.name
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
              )}
            >
              <div className="flex items-center">
                {item.name}
              </div>
              <div className="flex items-center gap-2">
                {item.isNew && (
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                    New
                  </span>
                )}
                {item.hasExternal && (
                  <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* My Account Section */}
        <div className="mt-6">
          <button 
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {isAccountOpen ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
            My Account
          </button>
          
          {isAccountOpen && (
            <div className="mt-1 space-y-1">
              {myAccount.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveItem(item.name)}
                  className={cn(
                    "block px-10 py-2 text-sm font-medium",
                    activeItem === item.name
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Admin & Support */}
        <div className="mt-2">
          <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <ChevronRight className="w-4 h-4 mr-2" />
            Admin
          </button>
          <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <ChevronRight className="w-4 h-4 mr-2" />
            Support
          </button>
        </div>
      </div>

      {/* Upgrade to Pro */}
      <div className="p-6">
        <button className="w-full flex items-center justify-center gap-2 rounded-full border border-[#00e5ff] bg-cyan-50 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-cyan-100 transition-colors">
          <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
          Upgrade to Pro
        </button>
      </div>
    </aside>
    </>
  );
}
