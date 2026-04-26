import { create } from "zustand";

export interface OnboardingData {
  // Step 1
  full_name: string;
  username: string;
  bio: string;
  avatarFile: File | null;
  avatarPreview: string | null;

  // Step 2
  university: string;
  program: string;
  graduation_year: string;

  // Step 3
  skills: string[];

  // Step 4
  github_url: string;
  linkedin_url: string;
  website_url: string;
}

interface OnboardingState {
  step: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  full_name: "",
  username: "",
  bio: "",
  avatarFile: null,
  avatarPreview: null,
  university: "",
  program: "",
  graduation_year: "",
  skills: [],
  github_url: "",
  linkedin_url: "",
  website_url: "",
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  data: { ...initialData },
  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  updateData: (partial) =>
    set((s) => ({ data: { ...s.data, ...partial } })),
  reset: () => set({ step: 1, data: { ...initialData } }),
}));
