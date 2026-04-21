import { create } from "zustand";

interface NotificationState {
  unreadMessages: number;
  setUnreadMessages: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadMessages: 0,
  setUnreadMessages: (count) => set({ unreadMessages: count }),
}));
