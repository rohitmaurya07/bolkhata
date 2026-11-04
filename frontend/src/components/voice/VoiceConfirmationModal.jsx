import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, RotateCcw, Edit3, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { closeConfirmationModal, openVoiceModal } from '../../store/uiSlice.js';
import { addTransaction } from '../../store/transactionSlice.js';
import { addPlannedExpense } from '../../store/plannedSlice.js';
import CategoryIcon from '../common/CategoryIcon.jsx';
import AmountDisplay from '../common/AmountDisplay.jsx';
import BigButton from '../common/BigButton.jsx';
import { getTranslation } from '../../utils/i18n.js';
import confetti from 'canvas-confetti';

export default function VoiceConfirmationModal() {
  const dispatch = useDispatch();
  const { confirmationModal } = useSelector((state) => state.ui);
  const language = useSelector((state) => state.auth.language) || 'hi';

  const { isOpen, parsedData, rawVoiceText, confirmationPrompt, isAmbiguous } = confirmationModal;

  const [editableData, setEditableData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (parsedData) {
      setEditableData({ ...parsedData });
      setIsEditing(isAmbiguous); // Open edit fields directly if input was ambiguous!
    }
  }, [parsedData, isAmbiguous]);

  if (!isOpen || !editableData) return null;

  const handleConfirmSave = async () => {
    // If intent was planned expense
    if (editableData.source === 'planned' || editableData.action === 'planned_expense') {
      const dueDate = editableData.date ? new Date(editableData.date) : new Date();
      await dispatch(
        addPlannedExpense({
          title: editableData.description || 'Upcoming bill',
          amount: Number(editableData.amount),
          category: editableData.category || 'bills',
          dueDate: dueDate.toISOString(),
          paymentMethod: editableData.paymentMethod || 'cash',
        })
      );
    } else {
      await dispatch(
        addTransaction({
          type: editableData.type || 'expense',
          amount: Number(editableData.amount),
          category: editableData.category || 'other',
          categoryName: editableData.categoryName || 'Other',
          categoryIcon: editableData.categoryIcon || 'Wallet',
          description: editableData.description || '',
          date: editableData.date ? new Date(editableData.date).toISOString() : new Date().toISOString(),
          paymentMethod: editableData.paymentMethod || 'cash',
          source: 'voice',
          rawVoiceText,
        })
      );
    }

    // Trigger cheerful confetti effect!
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (_) {}

    dispatch(closeConfirmationModal());
  };

  const handleTryAgain = () => {
    dispatch(closeConfirmationModal());
    dispatch(openVoiceModal());
  };

  const isExpense = editableData.type === 'expense';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-4">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-3xl p-6 shadow-2xl border border-warm-300 animate-slide-up flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-warm-200">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                isExpense
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isExpense ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
              {isExpense ? getTranslation(language, 'addExpense') : getTranslation(language, 'addIncome')}
            </span>
          </div>

          <button
            onClick={() => dispatch(closeConfirmationModal())}
            type="button"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ambiguity Alert Notice */}
        {isAmbiguous && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Please check transaction details:</p>
              <p>{confirmationPrompt || 'Amount or category was unclear from voice. Please review before saving.'}</p>
            </div>
          </div>
        )}

        {/* Big Amount and Category Presentation */}
        <div className="flex flex-col items-center justify-center my-5 p-4 rounded-3xl bg-warm-100 border border-warm-300">
          <CategoryIcon category={editableData.category} size="lg" className="mb-2" />

          {/* If Editing Amount */}
          {isEditing ? (
            <div className="w-full flex items-center justify-center gap-1 my-2">
              <span className="text-3xl font-extrabold text-slate-800">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                value={editableData.amount || ''}
                onChange={(e) => setEditableData({ ...editableData, amount: e.target.value })}
                className="w-40 text-center text-4xl font-black bg-white rounded-2xl border-2 border-brand-500 py-1 text-slate-900 focus:outline-none"
                placeholder="0"
                autoFocus
              />
            </div>
          ) : (
            <AmountDisplay
              amount={editableData.amount}
              type={isExpense ? 'expense' : 'income'}
              size="xl"
              showSign={true}
              className="my-1"
            />
          )}

          <p className="text-base font-extrabold text-slate-800 mt-1">
            {editableData.categoryName || getTranslation(language, 'categories', editableData.category)}
          </p>

          {/* Raw spoken utterance */}
          {rawVoiceText && (
            <p className="text-xs text-slate-500 italic mt-1 text-center line-clamp-1">
              &ldquo;{rawVoiceText}&rdquo;
            </p>
          )}
        </div>

        {/* Details Checklist (Payment method, date, description) */}
        <div className="space-y-2 mb-5 text-sm">
          <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-warm-50 border border-warm-200">
            <span className="text-slate-500 font-medium">{getTranslation(language, 'paymentMethod')}:</span>
            {isEditing ? (
              <select
                value={editableData.paymentMethod || 'cash'}
                onChange={(e) => setEditableData({ ...editableData, paymentMethod: e.target.value })}
                className="bg-white border border-warm-300 rounded-lg px-2 py-1 text-xs font-bold"
              >
                <option value="cash">{getTranslation(language, 'cash')}</option>
                <option value="upi">{getTranslation(language, 'upi')}</option>
                <option value="bank">{getTranslation(language, 'bank')}</option>
                <option value="card">{getTranslation(language, 'card')}</option>
              </select>
            ) : (
              <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                {getTranslation(language, editableData.paymentMethod || 'cash')}
              </span>
            )}
          </div>

          {/* Description input if editing */}
          {isEditing && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500">Note / Description:</label>
              <input
                type="text"
                value={editableData.description || ''}
                onChange={(e) => setEditableData({ ...editableData, description: e.target.value })}
                placeholder="Add optional note"
                className="bg-white border border-warm-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5">
          <BigButton
            onClick={handleConfirmSave}
            variant="primary"
            icon={Check}
            disabled={!editableData.amount || Number(editableData.amount) <= 0}
            className="w-full"
          >
            {getTranslation(language, 'confirmSave')}
          </BigButton>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              type="button"
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-white border border-warm-300 hover:border-slate-400 text-slate-700 font-bold text-sm active:scale-95 transition-all"
            >
              <Edit3 size={16} />
              <span>{isEditing ? 'Done Editing' : getTranslation(language, 'manualEdit')}</span>
            </button>

            <button
              onClick={handleTryAgain}
              type="button"
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-white border border-warm-300 hover:border-slate-400 text-slate-700 font-bold text-sm active:scale-95 transition-all"
            >
              <RotateCcw size={16} />
              <span>{getTranslation(language, 'tryAgain')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

