import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers, ArrowRight, CheckCircle2, AlertCircle,
  Sparkles, TrendingDown, BedDouble, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useEstimate } from '../context/EstimateContext';
import { api } from '../services/api';
import { RoomComparisonResponse } from '../types';
import { formatRupees, paiseToRupees } from '../utils/formatters';

type Lang = 'en' | 'hi' | 'mr';

const t: Record<string, Record<Lang, string>> = {
  tariff_analysis: {
    en: 'Interactive Room Tariff Analysis',
    hi: 'इंटरैक्टिव कमरा किराया विश्लेषण',
    mr: 'परस्परसंवादी खोली भाडे विश्लेषण',
  },
  compare_title: {
    en: 'Room Category Financial Comparison',
    hi: 'कमरा श्रेणी वित्तीय तुलना',
    mr: 'खोली श्रेणी आर्थिक तुलना',
  },
  compare_desc: {
    en: 'Running identical medical charges across available room tiers under',
    hi: 'समान चिकित्सा शुल्कों की तुलना विभिन्न कमरा श्रेणियों में पॉलिसी के अंतर्गत:',
    mr: 'समान वैद्यकीय शुल्कांची तुलना उपलब्ध खोली प्रकारांमध्ये पॉलिसी अंतर्गत:',
  },
  recalculate: {
    en: 'Recalculate Scenarios',
    hi: 'परिदृश्यों की पुनः गणना करें',
    mr: 'स्थितींची पुन्हा गणना करा',
  },
  optimal_recommendation: {
    en: 'Optimal Financial Recommendation',
    hi: 'सर्वोत्तम वित्तीय अनुशंसा',
    mr: 'सर्वोत्तम आर्थिक शिफारस',
  },
  choose_prefix: {
    en: 'Choose',
    hi: 'चुनें',
    mr: 'निवडा',
  },
  choose_suffix: {
    en: 'to maximize your insurance coverage',
    hi: 'ताकि आपको अधिकतम बीमा कवरेज मिल सके',
    mr: 'जास्तीत जास्त विमा संरक्षण मिळवण्यासाठी',
  },
  optimal_desc: {
    en: "Staying in this category keeps your room rate comfortably within your policy's room rent limit, completely eliminating the proportionate deduction penalty on your surgeon and OT fees.",
    hi: 'इस श्रेणी में रहने से आपका कमरा किराया पॉलिसी सीमा के भीतर रहता है, जिससे सर्जन और ओटी शुल्क पर आनुपातिक कटौती का दंड पूरी तरह समाप्त हो जाता है।',
    mr: 'या श्रेणीत राहिल्याने खोलीचे भाडे पॉलिसी मर्यादेत राहते, ज्यामुळे सर्जन आणि ओटी शुल्कावरील प्रमाणातील कपातीचा दंड पूर्णपणे टळतो.',
  },
  potential_savings: {
    en: 'Potential family savings vs. currently selected room:',
    hi: 'वर्तमान में चुने कमरे की तुलना में संभावित पारिवारिक बचत:',
    mr: 'सध्या निवडलेल्या खोलीच्या तुलनेत संभाव्य कौटुंबिक बचत:',
  },
  chart_title: {
    en: 'Visual Financial Split: Insurer vs. Family Payment (in ₹)',
    hi: 'वित्तीय विभाजन: बीमा भुगतान बनाम परिवार का खर्च (₹ में)',
    mr: 'आर्थिक विभागणी: विमा भरपाई विरुद्ध कुटुंबाचा खर्च (₹ मध्ये)',
  },
  insurer_pays: {
    en: 'Insurer Pays',
    hi: 'बीमा कंपनी भुगतान',
    mr: 'विमा कंपनी भरपाई',
  },
  family_oop: {
    en: 'Family Out-of-Pocket',
    hi: 'परिवार का जेब खर्च',
    mr: 'कुटुंबाचा स्वखर्च',
  },
  per_day: {
    en: '/ day',
    hi: '/ दिन',
    mr: '/ दिवस',
  },
  best_value: {
    en: 'Best Value',
    hi: 'सर्वोत्तम विकल्प',
    mr: 'सर्वोत्तम पर्याय',
  },
  selected: {
    en: 'Selected',
    hi: 'चयनित',
    mr: 'निवडलेले',
  },
  total_bill: {
    en: 'Total Bill:',
    hi: 'कुल बिल:',
    mr: 'एकूण बिल:',
  },
  family_pays: {
    en: 'Family Pays:',
    hi: 'परिवार भुगतान:',
    mr: 'कुटुंब भरपाई:',
  },
  saves: {
    en: 'Saves',
    hi: 'बचत',
    mr: 'बचत',
  },
  extra: {
    en: 'extra',
    hi: 'अतिरिक्त',
    mr: 'अतिरिक्त',
  },
  select_room: {
    en: 'Select This Room',
    hi: 'यह कमरा चुनें',
    mr: 'ही खोली निवडा',
  },
};

const i = (key: string, lang: Lang): string => t[key]?.[lang] || t[key]?.['en'] || key;

export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const { input, policy, setInput, language } = useEstimate();

  const [comparison, setComparison] = useState<RoomComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.compareRooms({ ...input, inputs_confirmed: true });
      setComparison(res);
    } catch (err: any) {
      setError(err.message || 'Room comparison failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [input.room_rate_per_day_paise, input.other_charges_paise, policy?.policy_id]);

  const lang: Lang = language;

  const chartData = comparison?.scenarios.map((s) => ({
    name: s.room_category.replace(' (Semi-Private)', '').replace(' Room', ''),
    insurerPayment: paiseToRupees(s.insurer_payment_paise),
    familyPayment: paiseToRupees(s.family_payment_paise),
    ratePerDay: paiseToRupees(s.room_rate_per_day_paise),
  })) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {i('tariff_analysis', lang)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {i('compare_title', lang)}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {i('compare_desc', lang)}{' '}
            <strong className="text-slate-700">{policy?.policy_name}</strong>.
          </p>
        </div>

        <button
          onClick={fetchComparison}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{i('recalculate', lang)}</span>
        </button>
      </div>

      {/* Recommendation Banner */}
      {comparison && comparison.recommended_category && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-100 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{i('optimal_recommendation', lang)}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black">
            {i('choose_prefix', lang)} "{comparison.recommended_category}" {i('choose_suffix', lang)}
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed max-w-2xl">
            {i('optimal_desc', lang)}
            {comparison.savings_vs_selected_paise > 0 && (
              <span className="font-extrabold text-white block mt-1">
                {i('potential_savings', lang)} {formatRupees(comparison.savings_vs_selected_paise)}!
              </span>
            )}
          </p>
        </div>
      )}

      {/* Comparison Recharts Visual Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {i('chart_title', lang)}
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
                {i('insurer_pays', lang)}
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                {i('family_oop', lang)}
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="insurerPayment" name={i('insurer_pays', lang)} fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="familyPayment" name={i('family_oop', lang)} fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Cards */}
      {comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {comparison.scenarios.map((s) => {
            const isSelected = input.room_category === s.room_category;
            return (
              <div
                key={s.room_category}
                className={`p-5 rounded-2xl border-2 transition-all space-y-4 flex flex-col justify-between ${
                  s.is_lowest_out_of_pocket
                    ? 'border-emerald-500 bg-emerald-50/30 shadow-md'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {formatRupees(s.room_rate_per_day_paise)} {i('per_day', lang)}
                    </span>
                    {s.is_lowest_out_of_pocket && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {i('best_value', lang)}
                      </span>
                    )}
                    {isSelected && !s.is_lowest_out_of_pocket && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {i('selected', lang)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{s.room_category}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{s.notes}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-200/80 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{i('total_bill', lang)}</span>
                    <span className="font-semibold text-slate-800">{formatRupees(s.total_bill_paise)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{i('insurer_pays', lang)}:</span>
                    <span className="font-bold text-emerald-600">{formatRupees(s.insurer_payment_paise)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                    <span className="text-slate-900">{i('family_pays', lang)}</span>
                    <span className={s.is_lowest_out_of_pocket ? 'text-emerald-700 font-extrabold text-sm' : 'text-rose-600 font-extrabold text-sm'}>
                      {formatRupees(s.family_payment_paise)}
                    </span>
                  </div>

                  {s.difference_from_selected_paise !== 0 && (
                    <div className="text-[11px] font-semibold text-right pt-1">
                      {s.difference_from_selected_paise < 0 ? (
                        <span className="text-emerald-600">
                          {i('saves', lang)} {formatRupees(Math.abs(s.difference_from_selected_paise))}
                        </span>
                      ) : (
                        <span className="text-rose-600">
                          +{formatRupees(s.difference_from_selected_paise)} {i('extra', lang)}
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setInput((prev) => ({
                        ...prev,
                        room_category: s.room_category,
                        room_rate_per_day_paise: s.room_rate_per_day_paise,
                      }));
                      navigate('/estimate/review');
                    }}
                    className={`w-full mt-2 py-2 rounded-lg font-bold text-xs transition-colors ${
                      s.is_lowest_out_of_pocket
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {i('select_room', lang)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
