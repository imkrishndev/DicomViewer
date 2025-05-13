import { create } from 'zustand';

interface ViewerState {
  tool: string;
  setTool: (tool: string) => void;
  windowLevel: {
    windowWidth: number;
    windowCenter: number;
  };
  setWindowLevel: (windowWidth: number, windowCenter: number) => void;
  resetWindowLevel: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  tool: 'pan',
  setTool: (tool) => set({ tool }),
  windowLevel: {
    windowWidth: 400,
    windowCenter: 40
  },
  setWindowLevel: (windowWidth, windowCenter) => set({
    windowLevel: { windowWidth, windowCenter }
  }),
  resetWindowLevel: () => set({
    windowLevel: { windowWidth: 400, windowCenter: 40 }
  })
}));