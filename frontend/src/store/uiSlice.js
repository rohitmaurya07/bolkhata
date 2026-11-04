import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isVoiceModalOpen: false,
    confirmationModal: {
      isOpen: false,
      parsedData: null,
      rawVoiceText: '',
      confirmationPrompt: '',
      isAmbiguous: false,
    },
    undoToast: {
      isVisible: false,
      item: null,
      message: '',
    },
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingSyncCount: 0,
  },
  reducers: {
    openVoiceModal: (state) => {
      state.isVoiceModalOpen = true;
    },
    closeVoiceModal: (state) => {
      state.isVoiceModalOpen = false;
    },
    openConfirmationModal: (state, action) => {
      state.confirmationModal = {
        isOpen: true,
        parsedData: action.payload.data,
        rawVoiceText: action.payload.rawVoiceText || '',
        confirmationPrompt: action.payload.confirmationPrompt || '',
        isAmbiguous: action.payload.isAmbiguous || false,
      };
      state.isVoiceModalOpen = false;
    },
    closeConfirmationModal: (state) => {
      state.confirmationModal.isOpen = false;
      state.confirmationModal.parsedData = null;
    },
    showUndoToast: (state, action) => {
      state.undoToast = {
        isVisible: true,
        item: action.payload.item,
        message: action.payload.message || 'Transaction deleted',
      };
    },
    hideUndoToast: (state) => {
      state.undoToast.isVisible = false;
      state.undoToast.item = null;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    setSyncingState: (state, action) => {
      state.isSyncing = action.payload.isSyncing;
      state.pendingSyncCount = action.payload.pendingCount || 0;
    },
  },
});

export const {
  openVoiceModal,
  closeVoiceModal,
  openConfirmationModal,
  closeConfirmationModal,
  showUndoToast,
  hideUndoToast,
  setOnlineStatus,
  setSyncingState,
} = uiSlice.actions;

export default uiSlice.reducer;

