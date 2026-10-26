import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, FileText, Image as ImageIcon, CheckCircle2,
  AlertTriangle, ArrowRight, X, RefreshCw, Sparkles, Eye
} from 'lucide-react';
import { api } from '../services/api';
import { useEstimate } from '../context/EstimateContext';
import { DocumentExtractResponse, PolicyExtractResponse } from '../types';
import { formatRupees, paiseToRupees } from '../utils/formatters';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { setInput, setExtractedDoc, aiStatus } = useEstimate();

  const [activeTab, setActiveTab] = useState<'hospital_image' | 'policy_text'>('hospital_image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [extractedData, setExtractedData] = useState<DocumentExtractResponse | null>(null);
  const [policyText, setPolicyText] = useState<string>('');
  const [extractedPolicy, setExtractedPolicy] = useState<PolicyExtractResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file exceeds the 10 MB limit.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.extractDocument(selectedFile);
      setExtractedData(res);
      setExtractedDoc(res);
    } catch (err: any) {
      setError(err.message || 'Image extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPolicyText = async () => {
    if (!policyText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.extractPolicyText(policyText);
      setExtractedPolicy(res);
    } catch (err: any) {
      setError(err.message || 'Policy extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleBill = async () => {
    try {
      const response = await fetch('/data/sample_hospital_bill.png');
      const blob = await response.blob();
      const file = new File([blob], 'sample_hospital_bill.png', { type: 'image/png' });
      handleFileSelect(file);
    } catch {
      setError('Sample bill image not found in public path.');
    }
  };

  const handleApplyExtractedData = () => {
    if (extractedData) {
      setInput((prev) => ({
        ...prev,
        hospital_name: extractedData.hospital_name || prev.hospital_name,
        room_category: extractedData.room_category || prev.room_category,
        room_rate_per_day_paise: extractedData.room_rate_per_day_paise || prev.room_rate_per_day_paise,
        room_days: extractedData.room_days || prev.room_days,
        other_charges_paise: extractedData.other_charges_paise || prev.other_charges_paise,
        excluded_charges_paise: extractedData.excluded_charges_paise || 0,
        inputs_confirmed: false,
      }));
      navigate('/estimate/review');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Document & Estimate Upload
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload hospital pre-admission cost sheets or paste policy clauses for offline extraction by local Gemma 4.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('hospital_image')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'hospital_image'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Hospital Estimate Image</span>
        </button>
        <button
          onClick={() => setActiveTab('policy_text')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'policy_text'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Policy Document & Clauses</span>
        </button>
      </div>

      {/* Tab 1: Hospital Estimate Image */}
      {activeTab === 'hospital_image' && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white p-8 rounded-2xl text-center transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Drag and drop hospital cost estimate image here
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPEG, PNG, WebP up to 10 MB. Processed 100% locally on your computer.
            </p>
            <div className="pt-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                Browse Files
              </button>
            </div>
          </div>

          {/* Quick Demo Sample Button */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-800">
                Want to test with a pre-seeded estimate?
              </span>
            </div>
            <button
              onClick={handleLoadSampleBill}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition-colors"
            >
              Load Sample Bill Image
            </button>
          </div>

          {/* Image Preview & Extract Action */}
          {selectedFile && previewUrl && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setExtractedData(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="object-contain max-h-64 w-auto" />
              </div>

              <button
                onClick={handleProcessImage}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting via Local Gemma 4...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Candidate Fields</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Extracted Fields Review Panel */}
          {extractedData && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Extracted Candidate Fields</h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Confidence: {extractedData.confidence}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] uppercase">Hospital Name</span>
                  <span className="font-bold text-slate-800">
                    {extractedData.hospital_name || 'Not detected'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] uppercase">Room Category</span>
                  <span className="font-bold text-slate-800">
                    {extractedData.room_category || 'Single Private Room'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] uppercase">Room Rate / Day</span>
                  <span className="font-bold text-slate-800">
                    {formatRupees(extractedData.room_rate_per_day_paise)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] uppercase">Stay Duration</span>
                  <span className="font-bold text-slate-800">{extractedData.room_days || 3} Days</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase">Other Medical Charges</span>
                  <span className="font-bold text-slate-800">
                    {formatRupees(extractedData.other_charges_paise)}
                  </span>
                </div>
              </div>

              {extractedData.uncertainties.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Extraction Verification Note:</span>
                  </div>
                  {extractedData.uncertainties.map((u, i) => (
                    <p key={i}>• {u}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleApplyExtractedData}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Confirm & Transfer to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Policy Text Extraction */}
      {activeTab === 'policy_text' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Paste Insurance Policy Excerpt
            </label>
            <textarea
              rows={6}
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              placeholder="e.g. Room Rent, Boarding & Nursing expenses incurred at the Hospital shall be limited to Rs. 5,000 per day. Proportionate deductions will apply to associated medical expenses in case of higher category room."
              className="w-full p-4 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <button
              onClick={handleProcessPolicyText}
              disabled={loading || !policyText.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Policy Clauses...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Candidate Policy Rules</span>
                </>
              )}
            </button>
          </div>

          {extractedPolicy && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Proposed Policy Clauses
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Room Limit Type</span>
                  <span className="font-bold text-slate-800">{extractedPolicy.room_limit_type}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Room Limit Value</span>
                  <span className="font-bold text-slate-800">
                    {extractedPolicy.room_limit_value ? formatRupees(extractedPolicy.room_limit_value) : 'None'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Proportionate Deductions</span>
                  <span className="font-bold text-slate-800">
                    {extractedPolicy.proportionate_deduction_applicable ? 'Applicable' : 'Not detected'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Co-payment</span>
                  <span className="font-bold text-slate-800">{extractedPolicy.copay_percentage || 0}%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                Rule candidates require human review and cannot be activated without confirmation.
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
