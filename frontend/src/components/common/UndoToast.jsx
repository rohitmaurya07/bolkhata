import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RotateCcw, X } from 'lucide-react';
import { undoDeleteTransaction } from '../../store/transactionSlice.js';
import { hideUndoToast } from '../../store/uiSlice.js';
import { getTranslation } from '../../utils/i18n.js';

export default function UndoToast() {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.auth.language) || 'hi';
  const { isVisible, item, message } = useSelector((state) => state.ui.undoToast);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      dispatch(hideUndoToast());
    }, 6000);
    return () => clearTimeout(timer);
  }, [isVisible, dispatch]);

  if (!isVisible || !item) return null;

  const handleUndo = () => {
    dispatch(undoDeleteTransaction(item));
    dispatch(hideUndoToast());
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 animate-slide-up">
        <span className="text-sm font-medium line-clamp-1">
          {message || getTranslation(language, 'deletedSuccess')}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all active:scale-95"
          >
            <RotateCcw size={14} />
            <span>{getTranslation(language, 'undo')}</span>
          </button>
          <button
            onClick={() => dispatch(hideUndoToast())}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

