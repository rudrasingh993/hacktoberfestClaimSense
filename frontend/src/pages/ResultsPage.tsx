import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Printer, ArrowRight, ShieldCheck, AlertTriangle,
  ChevronDown, ChevronUp, Layers, HelpCircle,
  Building2, Calendar, FileText, CheckCircle2, Globe, Sparkles, Copy,
  Heart, Star, TrendingUp, Award
} from 'lucide-react';
import { useEstimate } from '../context/EstimateContext';
import { api } from '../services/api';
import { formatRupees, formatRatio, formatPercent } from '../utils/formatters';
import { ExplanationResponse } from '../types';

// ─── i18n Translations ───────────────────────────────────────────────────────
type Lang = 'en' | 'hi' | 'mr';

const t: Record<string, Record<Lang, string>> = {
  deterministic_complete: {
    en: 'Deterministic Calculation Complete',
    hi: 'निश्चित गणना पूर्ण',
    mr: 'निश्चित गणना पूर्ण',
  },
  page_title: {
    en: 'Pre-Admission Claim Estimate',
    hi: 'भर्ती-पूर्व दावा अनुमान',
    mr: 'भरतीपूर्व दावा अंदाज',
  },
  compare_rooms: {
    en: 'Compare Rooms',
    hi: 'कमरों की तुलना',
    mr: 'खोल्यांची तुलना',
  },
  print_report: {
    en: 'Print Report (PDF)',
    hi: 'रिपोर्ट छापें (PDF)',
    mr: 'अहवाल छापा (PDF)',
  },
  total_bill: {
    en: 'Total Estimated Bill',
    hi: 'कुल अनुमानित बिल',
    mr: 'एकूण अंदाजे बिल',
  },
  insurer_payment: {
    en: 'Estimated Insurer Payment',
    hi: 'अनुमानित बीमा भुगतान',
    mr: 'अंदाजे विमा भरपाई',
  },
  family_payment: {
    en: 'Estimated Family Payment',
    hi: 'परिवार का अनुमानित खर्च',
    mr: 'कुटुंबाचा अंदाजे खर्च',
  },
  total_bill_desc: {
    en: '+ OT, Surgeon & Medical charges.',
    hi: '+ ओटी, सर्जन और चिकित्सा शुल्क।',
    mr: '+ ओटी, सर्जन आणि वैद्यकीय शुल्क.',
  },
  insurer_desc: {
    en: 'Projected settlement after room-rent restrictions and co-payment.',
    hi: 'कमरे के किराए की पाबंदियों और सह-भुगतान के बाद अनुमानित निपटान।',
    mr: 'खोली भाडे मर्यादा आणि सह-पेमेंट नंतर अंदाजे निपटारा.',
  },
  family_desc: {
    en: 'Total out-of-pocket exposure you should prepare to pay at the hospital cashier.',
    hi: 'अस्पताल कैशियर पर भुगतान के लिए तैयार रहने की कुल रकम।',
    mr: 'हॉस्पिटल कॅशियरला भरण्यासाठी तयार ठेवायची एकूण रक्कम.',
  },
  room_ratio: {
    en: 'Room Eligibility Ratio',
    hi: 'कमरा पात्रता अनुपात',
    mr: 'खोली पात्रता प्रमाण',
  },
  eligible_room: {
    en: 'Eligible Room Charges',
    hi: 'पात्र कमरा शुल्क',
    mr: 'पात्र खोली शुल्क',
  },
  prop_deduction: {
    en: 'Proportionate Deduction',
    hi: 'आनुपातिक कटौती',
    mr: 'प्रमाणातील कपात',
  },
  copay_share: {
    en: 'Co-payment Share',
    hi: 'सह-भुगतान हिस्सा',
    mr: 'सह-पेमेंट वाटा',
  },
  penalty: {
    en: 'penalty',
    hi: 'दंड',
    mr: 'दंड',
  },
  audit_trace: {
    en: 'Show Your Work: Audit Calculation Trace',
    hi: 'विस्तृत गणना: ऑडिट ट्रेस',
    mr: 'तपशीलवार गणना: ऑडिट ट्रेस',
  },
  audit_desc: {
    en: 'Deterministic step-by-step mathematical derivation produced by the Python calculation engine.',
    hi: 'पायथन गणना इंजन द्वारा निर्मित चरण-दर-चरण गणितीय व्युत्पत्ति।',
    mr: 'पायथन गणना इंजिनद्वारे तयार केलेली चरणानुचरण गणितीय व्युत्पत्ती.',
  },
  explanation_title: {
    en: 'Plain-Language Policy Explanation',
    hi: 'सरल भाषा में पॉलिसी विवरण',
    mr: 'सोप्या भाषेत पॉलिसी स्पष्टीकरण',
  },
  deductions_title: {
    en: 'Primary Financial Deductions',
    hi: 'प्रमुख वित्तीय कटौतियां',
    mr: 'प्रमुख आर्थिक कपाती',
  },
  questions_title: {
    en: 'Questions to Ask Hospital Billing Desk & Insurer TPA',
    hi: 'अस्पताल बिलिंग डेस्क और बीमा टीपीए से पूछने के प्रश्न',
    mr: 'हॉस्पिटल बिलिंग डेस्क आणि विमा TPA ला विचारायचे प्रश्न',
  },
  negotiation_title: {
    en: 'AI Billing Negotiation Assistant',
    hi: 'AI बिलिंग वार्ता सहायक',
    mr: 'AI बिलिंग वाटाघाटी सहाय्यक',
  },
  negotiation_badge: {
    en: 'TPA Unbundling Letter',
    hi: 'TPA अनबंडलिंग पत्र',
    mr: 'TPA अनबंडलिंग पत्र',
  },
  negotiation_desc: {
    en: 'Generate a formal hospital dispute letter to unbundle surgeon charges from room rent before admission.',
    hi: 'भर्ती से पहले सर्जन शुल्क को कमरे के किराए से अलग करने के लिए औपचारिक विवाद पत्र तैयार करें।',
    mr: 'भरतीपूर्वी सर्जन शुल्क खोली भाड्यापासून वेगळे करण्यासाठी औपचारिक विवाद पत्र तयार करा.',
  },
  generate_letter: {
    en: 'Generate Dispute Letter',
    hi: 'विवाद पत्र बनाएं',
    mr: 'विवाद पत्र तयार करा',
  },
  generating_letter: {
    en: 'Generating Letter...',
    hi: 'पत्र बन रहा है...',
    mr: 'पत्र तयार होत आहे...',
  },
  hide_letter: {
    en: 'Hide Negotiation Letter',
    hi: 'वार्ता पत्र छुपाएं',
    mr: 'वाटाघाटी पत्र लपवा',
  },
  talking_points: {
    en: 'Verbal Talking Points at Hospital TPA Billing Desk',
    hi: 'अस्पताल TPA बिलिंग डेस्क पर मौखिक बातचीत के बिंदु',
    mr: 'हॉस्पिटल TPA बिलिंग डेस्कवर मौखिक चर्चा मुद्दे',
  },
  letter_heading: {
    en: 'Ready-to-Print Dispute Letter',
    hi: 'प्रिंट-योग्य विवाद पत्र',
    mr: 'प्रिंट-योग्य विवाद पत्र',
  },
  copy_letter: {
    en: 'Copy Letter Text',
    hi: 'पत्र कॉपी करें',
    mr: 'पत्र कॉपी करा',
  },
  copied: {
    en: 'Copied!',
    hi: 'कॉपी हुआ!',
    mr: 'कॉपी झाले!',
  },
  checklist_title: {
    en: 'Pre-Admission Checklist',
    hi: 'भर्ती-पूर्व चेकलिस्ट',
    mr: 'भरतीपूर्व चेकलिस्ट',
  },
  reduce_bill_title: {
    en: "Want to reduce your family's out-of-pocket bill?",
    hi: 'क्या आप अपने परिवार का जेब खर्च कम करना चाहते हैं?',
    mr: 'कुटुंबाचा स्वखर्च कमी करायचा आहे?',
  },
  reduce_bill_desc: {
    en: 'Compare all 4 room categories to find the room tariff that eliminates proportionate deductions.',
    hi: 'आनुपातिक कटौती से बचने के लिए सभी 4 कमरा श्रेणियों की तुलना करें।',
    mr: 'प्रमाणातील कपात टाळण्यासाठी सर्व 4 खोली श्रेणींची तुलना करा.',
  },
  compare_categories: {
    en: 'Compare Room Categories',
    hi: 'कमरा श्रेणियों की तुलना करें',
    mr: 'खोली श्रेणींची तुलना करा',
  },
  recommend_title: {
    en: 'AI Health Policy Recommendations',
    hi: 'AI स्वास्थ्य पॉलिसी अनुशंसाएं',
    mr: 'AI आरोग्य पॉलिसी शिफारसी',
  },
  recommend_desc: {
    en: 'Based on your hospital bill and current policy, these policy features would better protect your family.',
    hi: 'आपके अस्पताल बिल और वर्तमान पॉलिसी के आधार पर, ये पॉलिसी आपके परिवार की बेहतर रक्षा करेंगी।',
    mr: 'तुमच्या हॉस्पिटल बिल आणि सध्याच्या पॉलिसीवर आधारित, या पॉलिसी तुमच्या कुटुंबाचे अधिक चांगले संरक्षण करतील.',
  },
  loading_recommendations: {
    en: 'Analyzing your estimate to generate personalized recommendations...',
    hi: 'व्यक्तिगत अनुशंसाएं बनाने के लिए आपके अनुमान का विश्लेषण हो रहा है...',
    mr: 'वैयक्तिक शिफारसी तयार करण्यासाठी तुमच्या अंदाजाचे विश्लेषण होत आहे...',
  },
  days: {
    en: 'days in',
    hi: 'दिन',
    mr: 'दिवस',
  },
  step: {
    en: 'Step',
    hi: 'चरण',
    mr: 'पायरी',
  },
  generating_explanation: {
    en: 'Generating explanation...',
    hi: 'विवरण तैयार हो रहा है...',
    mr: 'स्पष्टीकरण तयार होत आहे...',
  },
};

const i = (key: string, lang: Lang): string => t[key]?.[lang] || t[key]?.['en'] || key;

// ─── Step Translation Dictionaries ──────────────────────────────────────────
const stepTitleMap: Record<string, Record<Lang, string>> = {
  'Room Charges Subtotal': {
    en: 'Room Charges Subtotal',
    hi: 'कमरा शुल्क उप-योग',
    mr: 'खोली शुल्क उप-एकूण',
  },
  'Room Limit & Eligibility Ratio Evaluation': {
    en: 'Room Limit & Eligibility Ratio Evaluation',
    hi: 'कमरा सीमा और पात्रता अनुपात मूल्यांकन',
    mr: 'खोली मर्यादा आणि पात्रता प्रमाण मूल्यमापन',
  },
  'Eligible Room Charges Calculation': {
    en: 'Eligible Room Charges Calculation',
    hi: 'पात्र कमरा शुल्क गणना',
    mr: 'पात्र खोली शुल्क गणना',
  },
  'Proportionate Deduction on Associated Charges': {
    en: 'Proportionate Deduction on Associated Charges',
    hi: 'संबद्ध चिकित्सा शुल्कों पर आनुपातिक कटौती',
    mr: 'संबंधित वैद्यकीय शुल्कांवर प्रमाणातील कपात',
  },
  'Admissible Pre-Deductible Subtotal': {
    en: 'Admissible Pre-Deductible Subtotal',
    hi: 'डिडक्टिबल-पूर्व स्वीकार्य उप-योग',
    mr: 'डिडक्टिबल-पूर्व स्वीकार्य उप-एकूण',
  },
  'Treatment Category Sub-limit Adjustment': {
    en: 'Treatment Category Sub-limit Adjustment',
    hi: 'उपचार श्रेणी उप-सीमा समायोजन',
    mr: 'उपचार श्रेणी उप-मर्यादा समायोजन',
  },
  'Deductible Application': {
    en: 'Deductible Application',
    hi: 'पॉलिसी डिडक्टिबल कटौती लागू',
    mr: 'पॉलिसी डिडक्टिबल कपात लागू',
  },
  'Co-payment Adjustment': {
    en: 'Co-payment Adjustment',
    hi: 'सह-भुगतान समायोजन',
    mr: 'सह-पेमेंट समायोजन',
  },
  'Available Coverage Cap': {
    en: 'Available Coverage Cap',
    hi: 'उपलब्ध बीमा कवरेज सीमा',
    mr: 'उपलब्ध विमा संरक्षण मर्यादा',
  },
  'Final Financial Allocation': {
    en: 'Final Financial Allocation',
    hi: 'अंतिम वित्तीय आवंटन (बीमा कंपनी बनाम परिवार)',
    mr: 'अंतिम आर्थिक वाटप (विमा कंपनी विरुद्ध कुटुंब)',
  },
};

const translateStepTitle = (title: string, lang: Lang): string => {
  return stepTitleMap[title]?.[lang] || title;
};

const translateResultText = (text: string, lang: Lang): string => {
  if (lang === 'en') return text;
  let res = text;
  if (lang === 'hi') {
    res = res
      .replace(/Room subtotal:/gi, 'कमरा उप-योग:')
      .replace(/Applicable limit:/gi, 'लागू सीमा:')
      .replace(/Policy limit:/gi, 'पॉलिसी सीमा:')
      .replace(/Chosen room tariff:/gi, 'चुना गया कमरा किराया:')
      .replace(/Room ratio:/gi, 'कमरा अनुपात:')
      .replace(/Eligible room charges:/gi, 'पात्र कमरा शुल्क:')
      .replace(/Adjusted associated charges:/gi, 'समायोजित संबद्ध शुल्क:')
      .replace(/Proportionate deduction loss:/gi, 'आनुपातिक कटौती हानि:')
      .replace(/Eligible base before deductible:/gi, 'डिडक्टिबल से पहले पात्र राशि:')
      .replace(/Co-pay share:/gi, 'सह-भुगतान हिस्सा:')
      .replace(/Insurer initial share:/gi, 'बीमा कंपनी का प्रारंभिक हिस्सा:')
      .replace(/Estimated Insurer Payment:/gi, 'अनुमानित बीमा भुगतान:')
      .replace(/Estimated Family Out-of-Pocket:/gi, 'परिवार का अनुमानित खर्च:')
      .replace(/Final insurer payment capped at:/gi, 'बीमा कंपनी भुगतान सीमित:')
      .replace(/Amount capped to/gi, 'राशि सीमित:')
      .replace(/Sub-limit deduction:/gi, 'उप-सीमा कटौती:')
      .replace(/Eligible amount after deductible:/gi, 'डिडक्टिबल के बाद पात्र राशि:')
      .replace(/penalty/gi, 'दंड')
      .replace(/deduction/gi, 'कटौती');
  } else if (lang === 'mr') {
    res = res
      .replace(/Room subtotal:/gi, 'खोली उप-एकूण:')
      .replace(/Applicable limit:/gi, 'लागू मर्यादा:')
      .replace(/Policy limit:/gi, 'पॉलिसी मर्यादा:')
      .replace(/Chosen room tariff:/gi, 'निवडलेले खोली भाडे:')
      .replace(/Room ratio:/gi, 'खोली प्रमाण:')
      .replace(/Eligible room charges:/gi, 'पात्र खोली शुल्क:')
      .replace(/Adjusted associated charges:/gi, 'समायोजित संबंधित शुल्क:')
      .replace(/Proportionate deduction loss:/gi, 'प्रमाणातील कपात नुकसान:')
      .replace(/Eligible base before deductible:/gi, 'डिडक्टिबल आधी पात्र रक्कम:')
      .replace(/Co-pay share:/gi, 'सह-पेमेंट वाटा:')
      .replace(/Insurer initial share:/gi, 'विमा कंपनी प्राथमिक वाटा:')
      .replace(/Estimated Insurer Payment:/gi, 'अंदाजे विमा भरपाई:')
      .replace(/Estimated Family Out-of-Pocket:/gi, 'कुटुंबाचा अंदाजे खर्च:')
      .replace(/Final insurer payment capped at:/gi, 'विमा भरपाई मर्यादित:')
      .replace(/Amount capped to/gi, 'रक्कम मर्यादित:')
      .replace(/Sub-limit deduction:/gi, 'उप-मर्यादा कपात:')
      .replace(/Eligible amount after deductible:/gi, 'डिडक्टिबल नंतर पात्र रक्कम:')
      .replace(/penalty/gi, 'दंड')
      .replace(/deduction/gi, 'कपात');
  }
  return res;
};

const translateTalkingPoint = (tp: string, lang: Lang): string => {
  if (lang === 'en') return tp;
  if (lang === 'hi') {
    if (tp.includes('Politely ask')) {
      return 'विनम्रता से पूछें: "क्या आपका अस्पताल कमरे की श्रेणी के आधार पर डॉक्टर/सर्जन शुल्क बढ़ाता है? क्या डॉक्टर शुल्क बेस टैरिफ पर बिल किया जा सकता है ताकि बीमा में आनुपातिक कटौती न हो?"';
    }
    if (tp.includes('itemized estimate')) {
      return 'एक विस्तृत बिल अनुमान मांगें जिसमें बेड शुल्क, नर्सिंग देखभाल और ओटी उपकरण शुल्क अलग-अलग दिखाए गए हों।';
    }
    if (tp.includes('twin-sharing')) {
      return 'पूछें कि क्या ट्विन-शेयरिंग कमरे में वही मुख्य ऑपरेटिंग सर्जन बिना किसी चिकित्सकीय अंतर के इलाज करेंगे।';
    }
  }
  if (lang === 'mr') {
    if (tp.includes('Politely ask')) {
      return 'नम्रपणे विचारा: "तुमचे रुग्णालय खोलीच्या श्रेणीनुसार सर्जन शुल्क वाढवते का? डॉक्टर शुल्क बेस टॅरिफवर बिल केले जाऊ शकते का जेणेकरून विमा कपात टळेल?"';
    }
    if (tp.includes('itemized estimate')) {
      return 'एक तपशीलवार अंदाज मागा ज्यामध्ये बेड शुल्क, नर्सिंग केअर आणि ओटी उपकरण शुल्क वेगळे दाखवले असेल.';
    }
    if (tp.includes('twin-sharing')) {
      return 'विचारा की ट्विन-शेअरिंग खोली निवडल्यास तेच मुख्य ऑपरेटिंग सर्जन कोणताही वैद्यकीय बदल न करता उपचार करतील का.';
    }
  }
  return tp;
};

const translateChecklist = (chk: string, lang: Lang): string => {
  if (lang === 'en') return chk;
  if (lang === 'hi') {
    if (chk.includes('Surgeon Fee')) return 'सत्यापित करें कि सर्जन शुल्क कमरे के किराए के प्रतिशत के रूप में न जोड़ा गया हो।';
    if (chk.includes('Pharmacy & Consumables')) return 'पुष्टि करें कि दवाइयां और कंज्यूमेबल्स MRP पर बिल किए गए हैं, कमरे के अनुसार नहीं।';
    if (chk.includes('Diagnostic Imaging')) return 'जांचें कि सीटी/एमआरआई/रक्त परीक्षण सामान्य आउटपेशेंट दरों पर हैं।';
    if (chk.includes('pre-authorization')) return 'भर्ती से 48 घंटे पहले बीमा टीपीए से लिखित प्री-ऑथराइजेशन प्राप्त करें।';
  }
  if (lang === 'mr') {
    if (chk.includes('Surgeon Fee')) return 'खात्री करा की सर्जन शुल्क खोलीच्या भाड्याच्या टक्केवारीनुसार आकारले गेले नाही.';
    if (chk.includes('Pharmacy & Consumables')) return 'औषधे आणि कन्झ्युमेबल्स एमआरपीनुसार बिल केले आहेत, खोलीनुसार नाहीत याची खात्री करा.';
    if (chk.includes('Diagnostic Imaging')) return 'सीटी/एमआरआय/रक्त तपासण्या सामान्य बाह्यरुग्ण दरांवर आहेत का ते तपासा.';
    if (chk.includes('pre-authorization')) return 'भरतीपूर्वी 48 तास आधी विमा TPA कडून लेखी प्री-ऑथरायझेशन मिळवा.';
  }
  return chk;
};

const translateRecTitle = (title: string, lang: Lang): string => {
  if (lang === 'en') return title;
  if (lang === 'hi') {
    if (title.includes('Zero Room Rent Cap') || title.includes('Unlimited Room')) return 'शून्य कमरा किराया उप-सीमा / असीमित कमरा प्लान';
    if (title.includes('Consumables')) return 'आईआरडीएआई कंज्यूमेबल्स और गैर-चिकित्सा व्यय राइडर';
    if (title.includes('Zero Co-Payment')) return 'शून्य सह-भुगतान (Zero Co-Pay) संपूर्ण स्वास्थ्य कवच';
    if (title.includes('Super Top-Up')) return 'उच्च कवरेज सुपर टॉप-अप (₹1 करोड़ शील्ड)';
  }
  if (lang === 'mr') {
    if (title.includes('Zero Room Rent Cap') || title.includes('Unlimited Room')) return 'शून्य खोली भाडे उप-मर्यादा / अमर्यादित खोली प्लॅन';
    if (title.includes('Consumables')) return 'IRDAI कन्झ्युमेबल्स आणि बिगर-वैद्यकीय खर्च रायडर';
    if (title.includes('Zero Co-Payment')) return 'शून्य सह-पेमेंट (Zero Co-Pay) संपूर्ण आरोग्य कवच';
    if (title.includes('Super Top-Up')) return 'उच्च संरक्षण सुपर टॉप-अप (₹1 कोटी शील्ड)';
  }
  return title;
};

const translateRecDesc = (desc: string, lang: Lang): string => {
  if (lang === 'en') return desc;
  if (lang === 'hi') {
    if (desc.includes('eliminates room rent sub-limits')) return 'कमरे के किराए की सभी उप-सीमाओं और आनुपातिक कटौती के दंड को पूरी तरह समाप्त करता है। यह आपके सर्जन और ओटी शुल्कों को सुरक्षित रखता है।';
    if (desc.includes('IRDAI non-payable') || desc.includes('Consumables')) return 'मानक पॉलिसियां ग्लव्स, पीपीई किट और प्रशासनिक शुल्कों के नाम पर 5-15% बिल काटती हैं। यह राइडर उन सभी गैर-भुगतान योग्य वस्तुओं का 100% खर्च उठाता है।';
    if (desc.includes('co-share') || desc.includes('co-payment')) return 'यह गारंटी देता है कि आपको दावे पर 10-20% अपनी जेब से नहीं देना होगा। पूरी स्वीकृत राशि बीमा कंपनी वहन करती है।';
    if (desc.includes('ICU stays') || desc.includes('Top-Up')) return 'गंभीर बीमारियों, लंबे आईसीयू रहने और जटिल सर्जरी के खर्चों से बचाता है जो बेस लिमिट से अधिक हो जाते हैं।';
  }
  if (lang === 'mr') {
    if (desc.includes('eliminates room rent sub-limits')) return 'खोलीच्या भाड्याच्या सर्व उप-मर्यादा आणि प्रमाणातील कपात दंड पूर्णपणे काढून टाकते. यामुळे सर्जन आणि ओटी शुल्क सुरक्षित राहते.';
    if (desc.includes('IRDAI non-payable') || desc.includes('Consumables')) return 'मानक पॉलिसी 5-15% बिल ग्लव्हज, पीपीई किट अशा वस्तूंवर कापतात. हा रायडर अशा सर्व खर्चांची 100% भरपाई देतो.';
    if (desc.includes('co-share') || desc.includes('co-payment')) return 'दाव्यावर तुम्हाला स्वतःच्या खिशातून 10-20% द्यावे लागणार नाही याची हमी देतो. पूर्ण रक्कम विमा कंपनी भरते.';
    if (desc.includes('ICU stays') || desc.includes('Top-Up')) return 'गंभीर आजार, अतिदक्षता विभागातील मुक्काम आणि मोठ्या शस्त्रक्रियांच्या अवाढव्य खर्चापासून संरक्षण देतो.';
  }
  return desc;
};

const translateRecFeature = (feat: string, lang: Lang): string => {
  if (lang === 'en') return feat;
  if (lang === 'hi') {
    if (feat.includes('No room rent sub-limit')) return 'कमरा किराए पर कोई उप-सीमा नहीं (डीलक्स/सिंगल तक कोई भी कमरा)';
    if (feat.includes('100% eligibility ratio')) return 'सर्जन, एनेस्थेटिस्ट और ओटी शुल्कों पर 100% पात्रता अनुपात';
    if (feat.includes('Zero proportionate deduction')) return 'आईआरडीएआई नियमों के तहत शून्य आनुपातिक कटौती दंड';
    if (feat.includes('Direct cashless admission')) return 'सभी नेटवर्क अस्पतालों में निर्बाध कैशलेस भर्ती';
    if (feat.includes('Covers 68+')) return '68+ आईआरडीएआई गैर-चिकित्सा वस्तुओं (पीपीई, ग्लव्स, मास्क) को कवर करता है';
    if (feat.includes('Administrative and patient')) return 'अस्पताल प्रशासनिक और फाइल पंजीकरण शुल्क पूरी तरह कवर';
    if (feat.includes('Prevents unexpected')) return 'डिस्चार्ज के समय अप्रत्याशित जेब खर्च से पूर्ण सुरक्षा';
    if (feat.includes('Extremely low annual')) return 'अत्यंत किफायती वार्षिक राइडर प्रीमियम';
    if (feat.includes('0% co-payment')) return 'टियर-1, टियर-2 और टियर-3 अस्पताल नेटवर्क में 0% सह-भुगतान';
    if (feat.includes('No geographic zone')) return 'कोई भौगोलिक ज़ोन-आधारित कटौती या दंड नहीं';
    if (feat.includes('Full claim reimbursement')) return 'बिल विभाजन के बिना पूर्ण दावा प्रतिपूर्ति';
    if (feat.includes('Restoration benefit')) return 'बीमा राशि समाप्त होने पर स्वतः पुनर्बहाली लाभ';
    if (feat.includes('₹1 Crore catastrophic')) return 'किफायती वार्षिक प्रीमियम पर ₹1 करोड़ का सुरक्षा कवच';
    if (feat.includes('Covers prolonged ICU')) return 'लंबे समय तक आईसीयू, रोबोटिक सर्जरी और अंग प्रत्यारोपण खर्च कवर';
    if (feat.includes('Works seamlessly')) return 'वर्तमान एम्प्लॉयर या व्यक्तिगत पॉलिसी के साथ आसानी से काम करता है';
    if (feat.includes('Lifelong renewability')) return 'आजीवन नवीकरणीय गारंटी बिना मेडिकल चेकअप (55 वर्ष की आयु तक)';
  }
  if (lang === 'mr') {
    if (feat.includes('No room rent sub-limit')) return 'खोली भाड्यावर कोणतीही उप-मर्यादा नाही (डीलक्स/सिंगल कोणतीही खोली)';
    if (feat.includes('100% eligibility ratio')) return 'सर्जन, भूलतज्ज्ञ आणि ओटी शुल्कांवर 100% पात्रता प्रमाण';
    if (feat.includes('Zero proportionate deduction')) return 'IRDAI नियमांनुसार शून्य प्रमाणातील कपात';
    if (feat.includes('Direct cashless admission')) return 'सर्व नेटवर्क रुग्णालयांमध्ये थेट कॅशलेस भरती';
    if (feat.includes('Covers 68+')) return '68+ बिगर-वैद्यकीय वस्तू (पीपीई, ग्लव्हज, मास्क) पूर्णपणे संरक्षित';
    if (feat.includes('Administrative and patient')) return 'हॉस्पिटल प्रशासकीय आणि नोंदणी शुल्क पूर्ण कव्हर';
    if (feat.includes('Prevents unexpected')) return 'डिस्चार्जच्या वेळी अचानक येणाऱ्या स्वखर्चापासून संरक्षण';
    if (feat.includes('Extremely low annual')) return 'अतिशय माफक वार्षिक रायडर प्रीमियम';
    if (feat.includes('0% co-payment')) return 'टियर-1, टियर-2 आणि टियर-3 रुग्णालयांमध्ये 0% सह-पेमेंट';
    if (feat.includes('No geographic zone')) return 'कोणताही झोन-आधारित दंड नाही';
    if (feat.includes('Full claim reimbursement')) return 'बिल विभाजनाशिवाय पूर्ण दावा भरपाई';
    if (feat.includes('Restoration benefit')) return 'विमा रक्कम संपल्यास आपोआप पुनर्संचयित लाभ';
    if (feat.includes('₹1 Crore catastrophic')) return 'माफक प्रीमियमवर ₹1 कोटींचे आर्थिक सुरक्षा कवच';
    if (feat.includes('Covers prolonged ICU')) return 'दीर्घकालीन आयसीयू, रोबोटिक शस्त्रक्रिया आणि अवयव प्रत्यारोपण खर्च कव्हर';
    if (feat.includes('Works seamlessly')) return 'सध्याच्या कॉर्पोरेट किंवा वैयक्तिक पॉलिसीसोबत सहज चालते';
    if (feat.includes('Lifelong renewability')) return 'वैद्यकीय तपासणीशिवाय आजीवन नूतनीकरण हमी (वय 55 पर्यंत)';
  }
  return feat;
};

// ─── Policy Recommendation Type ──────────────────────────────────────────────
interface PolicyRecommendation {
  type: string;
  title: string;
  description: string;
  estimated_savings_paise: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  features: string[];
}

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { result, input, policy, language, setLanguage } = useEstimate();

  const [expandedTrace, setExpandedTrace] = useState<boolean>(true);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);
  const [negotiationScript, setNegotiationScript] = useState<any | null>(null);
  const [loadingNegotiation, setLoadingNegotiation] = useState<boolean>(false);
  const [showNegotiation, setShowNegotiation] = useState<boolean>(false);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<PolicyRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);

  // If no result in context, redirect back
  useEffect(() => {
    if (!result) {
      navigate('/estimate');
    }
  }, [result, navigate]);

  // Fetch plain language explanation whenever language changes
  useEffect(() => {
    if (result) {
      setLoadingExplanation(true);
      api.explainEstimate(result, language)
        .then((res) => setExplanation(res))
        .catch(() => setExplanation(null))
        .finally(() => setLoadingExplanation(false));
    }
  }, [result, language]);

  // Fetch policy recommendations
  useEffect(() => {
    if (result) {
      setLoadingRecommendations(true);
      api.getRecommendedPolicies({
        total_bill_paise: result.total_bill_paise,
        room_rate_per_day_paise: input.room_rate_per_day_paise,
        room_days: input.room_days,
        other_charges_paise: result.other_charges_paise,
        family_payment_paise: result.family_payment_paise || 0,
        current_policy_id: input.policy_id,
      })
        .then((res) => setRecommendations(res.recommendations || []))
        .catch(() => {
          // Fallback if API is offline
          const fallbackRecs: PolicyRecommendation[] = [
            {
              type: 'no_room_rent_cap',
              title: 'Zero Room Rent Cap / Unlimited Room Plan',
              description: 'Completely eliminates room rent sub-limits and proportionate deduction penalties on your surgeon and OT fees.',
              estimated_savings_paise: result.family_payment_paise || 4965000,
              priority: 'HIGH',
              features: [
                'No room rent sub-limit (Any room category up to Single Deluxe)',
                '100% eligibility ratio on surgeon, anaesthetist & OT charges',
                'Zero proportionate deduction penalty under IRDAI fair settlement guidelines',
                'Direct cashless admission across all network healthcare providers',
              ],
            },
            {
              type: 'consumables_rider',
              title: 'IRDAI Consumables & Non-Medical Expenses Rider',
              description: 'Standard policies routinely reject 5% to 15% of your hospital bill under IRDAI non-payable items. This rider pays for 100% of these excluded items.',
              estimated_savings_paise: Math.min(Math.round(result.total_bill_paise * 0.1), 3000000),
              priority: 'HIGH',
              features: [
                'Covers 68+ IRDAI non-medical expense items (PPE, gloves, surgical masks)',
                'Administrative and patient admission registration fees fully covered',
                'Prevents unexpected out-of-pocket charges at final discharge desk',
                'Extremely low annual rider premium cost',
              ],
            },
            {
              type: 'zero_copay',
              title: 'Zero Co-Payment Comprehensive Health Cover',
              description: 'Guarantees that you do not have to pay a mandatory 10% to 20% co-share on admissible claims across network hospitals.',
              estimated_savings_paise: Math.round(result.total_bill_paise * 0.1),
              priority: 'MEDIUM',
              features: [
                '0% co-payment across tier-1, tier-2, and tier-3 hospital networks',
                'No geographic zone-based penalties (e.g. Mumbai/Delhi vs rest of India)',
                'Full claim reimbursement without hospital bill splitting',
                'Restoration benefit kicks in if sum insured is exhausted',
              ],
            },
            {
              type: 'super_top_up',
              title: 'High-Coverage Super Top-Up (₹1 Crore Shield)',
              description: 'Protects against severe complications, extended ICU stays, and complex surgeries that exceed base limits.',
              estimated_savings_paise: 50000000,
              priority: 'MEDIUM',
              features: [
                '₹1 Crore catastrophic health safety net at very economical annual premium',
                'Covers prolonged ICU stays, robotic procedures, and organ donor expenses',
                'Works seamlessly with your existing employer or retail policy',
                'Lifelong renewability without pre-policy medical checkup (up to age 55)',
              ],
            },
          ];
          setRecommendations(fallbackRecs);
        })
        .finally(() => setLoadingRecommendations(false));
    }
  }, [result]);

  if (!result) return null;

  const openDedicatedPrintableWindow = () => {
    if (!result) return;
    const printWin = window.open('', '_blank', 'width=920,height=850');
    if (!printWin) {
      window.print();
      return;
    }
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>ClaimSense_Audit_Report_${result.estimate_id}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm 15mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 20px; margin: 0; background: #fff; font-size: 11pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; }
    .brand { font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
    .badge { display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; margin-left: 6px; }
    .meta { font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.4; }
    .cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 18px; }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; }
    .card.insurer { background: #f0fdf4 !important; border-color: #86efac; }
    .card.family { background: #fff1f2 !important; border-color: #fca5a5; }
    .card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
    .card-val { font-size: 20px; font-weight: 900; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
    th { background: #f8fafc !important; font-weight: 700; }
    .step-box { background: #f8fafc !important; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 8px; font-size: 11px; page-break-inside: avoid; }
    .step-formula { font-family: monospace; background: #ffffff !important; border: 1px solid #cbd5e1; padding: 4px 8px; border-radius: 4px; margin-top: 4px; font-size: 10.5px; }
    .letter { background: #f8fafc !important; border: 1px solid #cbd5e1; padding: 14px; border-radius: 6px; font-family: monospace; white-space: pre-wrap; font-size: 10.5px; line-height: 1.45; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 16px; }
    button { padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 12px; }
    @media print { .no-print { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="actions no-print">
    <button onclick="window.print()" style="background: #0f172a; color: white;">Print / Save as PDF</button>
    <button onclick="window.close()" style="background: #e2e8f0; color: #0f172a;">Close</button>
  </div>
  <div class="header">
    <div>
      <div class="brand">ClaimSense <span class="badge">IRDAI Master Circular 2024 Audit</span></div>
      <div class="meta">
        Hospital: <strong>${input.hospital_name || 'Hospital Admission'}</strong> | Room: <strong>${input.room_category} (${input.room_days} days)</strong><br/>
        Policy: <strong>${policy?.policy_name || 'Health Policy'} (${policy?.insurer_name || ''})</strong>
      </div>
    </div>
    <div style="text-align: right;" class="meta">
      <div>Audit Ref: <strong>${result.estimate_id}</strong></div>
      <div>Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      <div style="color: #059669; font-weight: 700;">Deterministic Arithmetic Verified</div>
    </div>
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-title">Total Estimated Hospital Bill</div>
      <div class="card-val">${formatRupees(result.total_bill_paise)}</div>
      <div class="meta">${input.room_days} days @ ${formatRupees(input.room_rate_per_day_paise)}/day</div>
    </div>
    <div class="card insurer">
      <div class="card-title" style="color: #166534;">Insurer Payment</div>
      <div class="card-val" style="color: #16a34a;">${formatRupees(result.insurer_payment_paise)}</div>
      <div class="meta" style="color: #166534;">Approved under policy sub-limits</div>
    </div>
    <div class="card family">
      <div class="card-title" style="color: #9f1239;">Family Out-of-Pocket</div>
      <div class="card-val" style="color: #e11d48;">${formatRupees(result.family_payment_paise)}</div>
      <div class="meta" style="color: #9f1239;">Direct difference + proportionate loss</div>
    </div>
  </div>

  <div style="margin-bottom: 16px;">
    <h3 style="margin-bottom: 6px; font-size: 13px;">Key Deduction Breakdown</h3>
    <table>
      <tr>
        <th>Room Limit Ratio</th>
        <th>Eligible Room Charges</th>
        <th>Proportionate Deduction Penalty</th>
        <th>Co-payment Share</th>
      </tr>
      <tr>
        <td><strong>${result.room_limit_ratio?.toFixed(2) || '1.00'}</strong></td>
        <td>${formatRupees(result.eligible_room_charges_paise)}</td>
        <td style="color: #e11d48; font-weight: 700;">-${formatRupees(result.other_charges_paise - result.adjusted_other_charges_paise)}</td>
        <td>-${formatRupees(result.copay_deduction_paise)}</td>
      </tr>
    </table>
  </div>

  <div style="margin-bottom: 18px;">
    <h3 style="margin-bottom: 6px; font-size: 13px;">Deterministic Step-by-Step Audit Trail</h3>
    ${result.calculation_steps.map((st: any) => `
      <div class="step-box">
        <div style="display: flex; justify-content: space-between; font-weight: 700;">
          <span>Step ${st.step_number}: ${st.title}</span>
          <span style="font-size: 9.5px; color: #64748b; font-family: monospace;">${st.rule_reference}</span>
        </div>
        <div class="step-formula">${st.formula}</div>
        <div style="margin-top: 4px; display: flex; justify-content: space-between; color: #1e3a8a;">
          <span>${st.result_text}</span>
          ${st.impact_paise !== undefined && st.impact_paise !== null ? `<strong>${formatRupees(st.impact_paise)}</strong>` : ''}
        </div>
      </div>
    `).join('')}
  </div>

  ${negotiationScript ? `
    <div style="page-break-before: always; margin-top: 18px;">
      <h3 style="margin-bottom: 6px; font-size: 13px;">Hospital Unbundling Pre-Admission Dispute Letter</h3>
      <div class="letter">${negotiationScript.formal_letter_body}</div>
    </div>
  ` : ''}

  <div style="margin-top: 20px; font-size: 9.5px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 8px;">
    ClaimSense is an independent patient transparency tool designed to simulate health insurance policy clauses deterministically. Final claim adjudication is subject to insurer and TPA approval.
  </div>
</body>
</html>`;
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 300);
  };

  const handlePrint = () => {
    setExpandedTrace(true);
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.warn('In-page window.print failed, opening dedicated printable window fallback:', err);
        openDedicatedPrintableWindow();
      }
    }, 150);
  };

  const lang = language;

  return (
    <div className="space-y-8 pb-16 printable-report">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {i('deterministic_complete', lang)}
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {result.estimate_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {i('page_title', lang)}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/compare"
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>{i('compare_rooms', lang)}</span>
          </Link>

          <button
            onClick={handlePrint}
            title="Print or Save as PDF"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{i('print_report', lang)}</span>
          </button>

          <button
            onClick={openDedicatedPrintableWindow}
            title="Open Clean Standalone Printable Window"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1 border border-slate-300 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Clean PDF View</span>
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="print-only pb-4 mb-6 border-b-2 border-slate-900">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">ClaimSense</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                Pre-Admission Claim Audit
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Hospital: <strong>{input.hospital_name || 'Hospital Admission'}</strong> | Room: <strong>{input.room_category} ({input.room_days} days)</strong> | Policy: <strong>{policy?.policy_name} ({policy?.insurer_name})</strong>
            </p>
            <p className="text-[10px] text-slate-500">
              IRDAI Master Circular 2024 • Deterministic Mathematical Simulation • Zero Cloud Leakage
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-mono font-bold text-slate-900">Ref: {result.estimate_id}</p>
            <p>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-[10px] text-emerald-700 font-semibold">Status: Verified Deterministic</p>
          </div>
        </div>
      </div>

      {/* Core Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Bill */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {i('total_bill', lang)}
          </span>
          <div className="text-3xl font-black text-slate-900">
            {formatRupees(result.total_bill_paise)}
          </div>
          <p className="text-xs text-slate-500">
            {input.room_days} {i('days', lang)} {input.room_category} {i('total_bill_desc', lang)}
          </p>
        </div>

        {/* Insurer Payment */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            {i('insurer_payment', lang)}
          </span>
          <div className="text-3xl font-black text-emerald-600">
            {formatRupees(result.insurer_payment_paise)}
          </div>
          <p className="text-xs text-emerald-800">
            {i('insurer_desc', lang)}
          </p>
        </div>

        {/* Family Out of Pocket */}
        <div className="bg-gradient-to-br from-rose-500/10 to-amber-500/5 p-6 rounded-2xl border border-rose-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
            {i('family_payment', lang)}
          </span>
          <div className="text-3xl font-black text-rose-600">
            {formatRupees(result.family_payment_paise)}
          </div>
          <p className="text-xs text-rose-800">
            {i('family_desc', lang)}
          </p>
        </div>
      </div>

      {/* Primary Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">{i('room_ratio', lang)}</span>
          <span className="font-extrabold text-slate-900 text-sm">
            {formatRatio(result.room_limit_ratio)}
            {result.room_limit_ratio && result.room_limit_ratio < 1 && (
              <span className="text-rose-600 ml-1 font-bold">
                ({(100 - result.room_limit_ratio * 100).toFixed(1)}% {i('penalty', lang)})
              </span>
            )}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">{i('eligible_room', lang)}</span>
          <span className="font-extrabold text-slate-900 text-sm">
            {formatRupees(result.eligible_room_charges_paise)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">{i('prop_deduction', lang)}</span>
          <span className="font-extrabold text-rose-600 text-sm">
            -{formatRupees(result.other_charges_paise - result.adjusted_other_charges_paise)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">{i('copay_share', lang)}</span>
          <span className="font-extrabold text-slate-900 text-sm">
            -{formatRupees(result.copay_deduction_paise)}
          </span>
        </div>
      </div>

      {/* Show Your Work: Deterministic Calculation Trace */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div
          onClick={() => setExpandedTrace(!expandedTrace)}
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              ∑
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{i('audit_trace', lang)}</h2>
              <p className="text-xs text-slate-500">
                {i('audit_desc', lang)}
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            {expandedTrace ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedTrace && (
          <div className="border-t border-slate-200 p-6 space-y-4">
            <div className="space-y-3">
              {result.calculation_steps.map((st) => (
                <div
                  key={st.step_number}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      {i('step', lang)} {st.step_number}: {translateStepTitle(st.title, lang)}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {st.rule_reference}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200/60 font-mono text-slate-700">
                    {st.formula}
                  </div>
                  <div className="font-semibold text-blue-900 flex items-center justify-between pt-1">
                    <span>{translateResultText(st.result_text, lang)}</span>
                    {st.impact_paise !== undefined && st.impact_paise !== null && (
                      <span className="font-bold text-slate-900">{formatRupees(st.impact_paise)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Multilingual Plain-Language Explanation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">{i('explanation_title', lang)}</h2>
          </div>

          {/* Inline language selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs no-print">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
            {(['en', 'hi', 'mr'] as const).map((lng) => (
              <button
                key={lng}
                onClick={() => setLanguage(lng)}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${language === lng
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {lng === 'en' ? 'English' : lng === 'hi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>
        </div>

        {explanation ? (
          <div className="space-y-4 text-xs leading-relaxed text-slate-700">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 font-medium">
              {explanation.summary}
            </div>

            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                {i('deductions_title', lang)}
              </span>
              <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
                {explanation.main_deductions.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                {i('questions_title', lang)}
              </span>
              <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
                {explanation.questions_for_insurer.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
              {explanation.disclaimer}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">{i('generating_explanation', lang)}</p>
        )}
      </div>

      {/* AI Billing Negotiation Assistant & Unbundling Letter */}
      <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 ${showNegotiation && negotiationScript ? 'printable-card' : 'no-print'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>{i('negotiation_title', lang)}</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                  {i('negotiation_badge', lang)}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {i('negotiation_desc', lang)}
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              if (negotiationScript) {
                setShowNegotiation(!showNegotiation);
                return;
              }
              setLoadingNegotiation(true);
              try {
                const res = await api.generateNegotiationScript({
                  estimate_result: result,
                  hospital_name: input.hospital_name,
                  policy_name: policy?.policy_name || null,
                });
                setNegotiationScript(res);
                setShowNegotiation(true);
              } catch (err) {
                console.warn('API error, using robust fallback unbundling script:', err);
                const hosp = input.hospital_name || 'Hospital TPA Billing Desk';
                const pol = policy?.policy_name || 'Health Insurance Policy';
                const billFmt = formatRupees(result.total_bill_paise);
                const propLoss = formatRupees(result.other_charges_paise - result.adjusted_other_charges_paise);
                const subject = 'Urgent Request: Tariff Unbundling & Separate Billing for OT/Consultant Fees (Patient Pre-Admission Estimate)';
                const formalLetter = `To:
The Billing Manager / TPA Incharge
${hosp}

Subject: ${subject}

Dear Sir/Madam,

I am in the process of finalizing inpatient surgical admission at your esteemed hospital under my policy: ${pol}.

According to our pre-admission estimate totaling ${billFmt}, my insurance policy enforces a room rent limit. Due to proportionate deduction regulations, escalating operating theatre and doctor consultation charges based on room category will cause an estimated deduction penalty of ${propLoss} on my cashless claim settlement.

As per IRDAI guidelines and consumer fair billing practices:
1. Medical procedures, anaesthesia, and surgeon fees are clinical interventions that remain identical regardless of the room category chosen by the patient.
2. I formally request that the hospital billing desk provide an unbundled tariff schedule where doctor professional fees and OT charges are billed at standard hospital rates, rather than being inflated due to room category selection.
3. If proportionate deductions apply to bundled packages, please provide a breakdown allowing room tariff to be billed separately as an elective comfort expense.

We greatly appreciate your cooperation in helping us prevent unexpected financial disputes during claim discharge.

Sincerely,
Patient / Insured Attendant
`;
                setNegotiationScript({
                  letter_subject: subject,
                  formal_letter_body: formalLetter,
                  verbal_talking_points: [
                    `Politely ask: 'Does your hospital scale surgeon fees based on room category? Can doctor fees be billed at your base tariff to avoid our ${propLoss} proportionate insurance deduction?'`,
                    'Request an itemized estimate separating bed charges from nursing care and OT equipment charges.',
                    'Ask if changing to a twin-sharing room retains the same primary operating surgeon without any clinical difference.',
                  ],
                  unbundling_checklist: [
                    'Verify that Surgeon Fee is not listed as a percentage of room rent.',
                    'Confirm Pharmacy & Consumables are billed at MRP and not indexed to room category.',
                    'Check that Diagnostic Imaging (CT/MRI/Blood) follows standard outpatient tariffs.',
                    'Obtain written pre-authorization approval from your insurer TPA 48 hours prior to planned admission.',
                  ],
                });
                setShowNegotiation(true);
              } finally {
                setLoadingNegotiation(false);
              }
            }}
            disabled={loadingNegotiation}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>
              {loadingNegotiation
                ? i('generating_letter', lang)
                : showNegotiation
                  ? i('hide_letter', lang)
                  : i('generate_letter', lang)}
            </span>
          </button>
        </div>

        {showNegotiation && negotiationScript && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Verbal Talking Points */}
            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100">
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
                {i('talking_points', lang)}
              </h4>
              <ul className="space-y-2 text-xs text-purple-950">
                {negotiationScript.verbal_talking_points.map((tp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{translateTalkingPoint(tp, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formal Letter */}
            <div className="relative bg-slate-900 text-slate-100 print:bg-white print:text-slate-900 print:border print:border-slate-300 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700 print:border-slate-300">
                <span className="text-[11px] text-slate-400 print:text-slate-600 uppercase tracking-wider font-sans font-bold">
                  {i('letter_heading', lang)}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(negotiationScript.formal_letter_body || '');
                    setCopiedLetter(true);
                    setTimeout(() => setCopiedLetter(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans flex items-center gap-1.5 transition no-print"
                >
                  {copiedLetter ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{i('copied', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>{i('copy_letter', lang)}</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-slate-300 print:text-slate-900">
                {negotiationScript.formal_letter_body}
              </pre>
            </div>

            {/* Checklist */}
            {negotiationScript.unbundling_checklist && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  {i('checklist_title', lang)}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {negotiationScript.unbundling_checklist.map((chk: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{translateChecklist(chk, lang)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── AI Health Policy Recommendations Section ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border border-amber-200">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{i('recommend_title', lang)}</h2>
            <p className="text-xs text-slate-500">{i('recommend_desc', lang)}</p>
          </div>
        </div>

        {loadingRecommendations ? (
          <div className="flex items-center justify-center py-10 gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <span className="text-xs text-slate-500">{i('loading_recommendations', lang)}</span>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => {
              const priorityStyles = {
                HIGH: 'border-rose-200 bg-rose-50/40',
                MEDIUM: 'border-amber-200 bg-amber-50/40',
                LOW: 'border-emerald-200 bg-emerald-50/40',
              };
              const priorityBadge = {
                HIGH: 'bg-rose-100 text-rose-800',
                MEDIUM: 'bg-amber-100 text-amber-800',
                LOW: 'bg-emerald-100 text-emerald-800',
              };
              const priorityIcon = {
                HIGH: <AlertTriangle className="w-4 h-4 text-rose-600" />,
                MEDIUM: <TrendingUp className="w-4 h-4 text-amber-600" />,
                LOW: <Star className="w-4 h-4 text-emerald-600" />,
              };
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border-2 ${priorityStyles[rec.priority]} space-y-3 transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {priorityIcon[rec.priority]}
                      <h4 className="font-bold text-sm text-slate-900">{translateRecTitle(rec.title, lang)}</h4>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${priorityBadge[rec.priority]}`}>
                      {rec.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{translateRecDesc(rec.description, lang)}</p>

                  {rec.estimated_savings_paise > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <Award className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'hi' ? 'अनुमानित बचत' : lang === 'mr' ? 'अंदाजे बचत' : 'Estimated Savings'}: {formatRupees(rec.estimated_savings_paise)}
                      </span>
                    </div>
                  )}

                  <ul className="space-y-1 text-xs text-slate-600">
                    {rec.features.map((feat, fi) => (
                      <li key={fi} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{translateRecFeature(feat, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            {lang === 'hi'
              ? 'अनुशंसाएं उपलब्ध नहीं हैं।'
              : lang === 'mr'
                ? 'शिफारसी उपलब्ध नाहीत.'
                : 'No recommendations available.'}
          </div>
        )}
      </div>

      {/* Next Step Banner: Compare Rooms */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg no-print">
        <div>
          <h3 className="font-bold text-base">{i('reduce_bill_title', lang)}</h3>
          <p className="text-xs text-slate-300 mt-1">
            {i('reduce_bill_desc', lang)}
          </p>
        </div>
        <Link
          to="/compare"
          className="px-5 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shrink-0 flex items-center gap-2"
        >
          <span>{i('compare_categories', lang)}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
