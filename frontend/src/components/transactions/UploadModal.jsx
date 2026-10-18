import React, { useState } from 'react';
import Modal from '../common/Modal';
import { UploadCloud, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { endpoints } from '../../services/api';

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [mapping, setMapping] = useState({
    date_col: 0,
    desc_col: 1,
    amount_mode: 'single', // 'single' or 'split'
    amount_col: 2,
    type_col: 3,
    debit_col: 2,
    credit_col: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setResult(null);

    // Call preview endpoint to auto-detect columns
    const formData = new FormData();
    formData.append('file', selected);

    try {
      setLoading(true);
      const data = await endpoints.previewCSV(formData);
      setPreviewData(data);

      const m = data.mapping || {};
      const isSplit = m.debit_col !== null && m.credit_col !== null;

      setMapping({
        date_col: m.date_col ?? 0,
        desc_col: m.desc_col ?? 1,
        amount_mode: isSplit ? 'split' : 'single',
        amount_col: m.amount_col ?? (isSplit ? 0 : 2),
        type_col: m.type_col ?? 3,
        debit_col: m.debit_col ?? 2,
        credit_col: m.credit_col ?? 3,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('date_col', mapping.date_col);
    formData.append('desc_col', mapping.desc_col);

    if (mapping.amount_mode === 'split') {
      formData.append('debit_col', mapping.debit_col);
      formData.append('credit_col', mapping.credit_col);
    } else {
      formData.append('amount_col', mapping.amount_col);
      if (mapping.type_col !== null && mapping.type_col !== undefined && mapping.type_col !== '') {
        formData.append('type_col', mapping.type_col);
      }
    }

    try {
      setLoading(true);
      setError(null);
      const res = await endpoints.processCSV(formData);
      setResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreviewData(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAll} title="Import Bank Statement CSV" maxWidth="max-w-xl">
      {result ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              CSV Import Completed!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Imported {result.new_transactions} new transactions ({result.duplicates_skipped} duplicates skipped).
            </p>
          </div>
          <button
            onClick={resetAll}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
          >
            Done & View Transactions
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* File Picker / Drag area */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              id="csvFileInput"
              className="hidden"
            />
            <label htmlFor="csvFileInput" className="cursor-pointer flex flex-col items-center gap-2">
              <UploadCloud className="w-10 h-10 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {file ? file.name : 'Click to select bank statement CSV'}
              </span>
              <span className="text-xs text-slate-400">
                Supports HDFC, SBI, ICICI, Axis, and all UPI statements
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Column Mapping Section when file is uploaded */}
          {previewData && previewData.headers && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Auto-Detected Column Mapping (Verify & Adjust)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Date column */}
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Date Column</label>
                  <select
                    value={mapping.date_col}
                    onChange={(e) => setMapping({ ...mapping, date_col: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    {previewData.headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i}: {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description column */}
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Description Column</label>
                  <select
                    value={mapping.desc_col}
                    onChange={(e) => setMapping({ ...mapping, desc_col: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    {previewData.headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i}: {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Mode selector */}
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-4 py-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={mapping.amount_mode === 'single'}
                        onChange={() => setMapping({ ...mapping, amount_mode: 'single' })}
                      />
                      <span>Single Amount Column</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={mapping.amount_mode === 'split'}
                        onChange={() => setMapping({ ...mapping, amount_mode: 'split' })}
                      />
                      <span>Separate Debit / Credit Columns</span>
                    </label>
                  </div>
                </div>

                {mapping.amount_mode === 'single' ? (
                  <>
                    <div>
                      <label className="block text-slate-500 mb-1 font-medium">Amount Column</label>
                      <select
                        value={mapping.amount_col}
                        onChange={(e) => setMapping({ ...mapping, amount_col: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        {previewData.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {i}: {h}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-medium">Type Column (Optional)</label>
                      <select
                        value={mapping.type_col ?? ''}
                        onChange={(e) =>
                          setMapping({
                            ...mapping,
                            type_col: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        <option value="">None (Positive=Credit, Negative=Debit)</option>
                        {previewData.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {i}: {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-slate-500 mb-1 font-medium">Debit Column</label>
                      <select
                        value={mapping.debit_col}
                        onChange={(e) => setMapping({ ...mapping, debit_col: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        {previewData.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {i}: {h}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 font-medium">Credit Column</label>
                      <select
                        value={mapping.credit_col}
                        onChange={(e) => setMapping({ ...mapping, credit_col: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                      >
                        {previewData.headers.map((h, i) => (
                          <option key={i} value={i}>
                            {i}: {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Action button */}
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {loading ? 'Processing & Categorizing...' : 'Process & Import'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
