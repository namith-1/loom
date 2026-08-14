import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Meeting = {
  id: string;
  title: string;
  time: string;
  date: string;
  isUpcoming: boolean;
};

interface DashboardState {
  userId: string;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  user: {
    name: string;
    initials: string;
    plan: string;
    pmi: string; // Personal Meeting ID
  };
  setUser: (name: string) => void;
  setSession: (name: string, userId: string) => void;
  
  upcomingMeetings: Meeting[];
  recentMeetings: Meeting[];
  setUpcomingMeetings: (meetings: Meeting[]) => void;
  setRecentMeetings: (meetings: Meeting[]) => void;
  
  isJoinModalOpen: boolean;
  setJoinModalOpen: (isOpen: boolean) => void;
  
  isScheduleModalOpen: boolean;
  setScheduleModalOpen: (isOpen: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      userId: `user-id-${Math.random().toString(36).substring(2, 9)}`,
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      user: {
        name: '',
        initials: '',
        plan: 'Workplace Basic',
        pmi: '277 808 3977'
      },
      setUser: (name: string) => set((state) => ({
        user: { ...state.user, name, initials: name.charAt(0).toUpperCase() }
      })),
      setSession: (name: string, userId: string) => set((state) => ({
        userId,
        user: { ...state.user, name, initials: name.charAt(0).toUpperCase() }
      })),
      
      upcomingMeetings: [],
      recentMeetings: [],
      setUpcomingMeetings: (meetings) => set({ upcomingMeetings: meetings }),
      setRecentMeetings: (meetings) => set({ recentMeetings: meetings }),
      
      isJoinModalOpen: false,
      setJoinModalOpen: (isOpen) => set({ isJoinModalOpen: isOpen }),
      
      isScheduleModalOpen: false,
      setScheduleModalOpen: (isOpen) => set({ isScheduleModalOpen: isOpen })
    }),
    {
      name: 'zoom-dashboard-storage',
      partialize: (state) => ({ userId: state.userId, user: state.user }),
    }
  )
);
