(function(){
'use strict';
if(window.__csUI)return;window.__csUI=true;

var RS='\u20B9';

/* ---------- logo: shield = your policy; teal part = what the insurer covers, amber part = your share ---------- */
var SH='M32 4l22 8v18c0 14-9 24-22 30C19 54 10 44 10 30V12z';
function mark(sw){
  return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="csclip"><path d="'+SH+'"/></clipPath></defs>'+
    '<g clip-path="url(#csclip)"><rect width="64" height="64" fill="#0B5D5E"/><rect y="39" width="64" height="25" fill="#F2A33A"/><rect y="38" width="64" height="2" fill="#fff"/></g>'+
    '<path d="M20 24l8 8 15-15" fill="none" stroke="#fff" stroke-width="'+(sw||4)+'" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/* ---------- icons ---------- */
function ic(p){return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';}
var I={
  overview:ic('<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="5" rx="1.6"/><rect x="14" y="12" width="7" height="9" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/>'),
  calc:ic('<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18.5h.01M12 18.5h3.5"/>'),
  policy:ic('<path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>'),
  how:ic('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  bars:ic('<path d="M5 20v-9M12 20V4M19 20v-6"/>'),
  list:ic('<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4h6v3H9zM9 14l2 2 4-4"/>'),
  globe:ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>'),
  chat:ic('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>'),
  send:ic('<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>'),
  x:ic('<path d="M18 6L6 18M6 6l12 12"/>'),
  go:ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  dl:ic('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'),
  share:ic('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/>')
};

/* ---------- text: English is the source, D holds translations keyed by the English string ---------- */
var E={
 tab_ov:'Overview',tab_es:'Estimator',tab_po:'Policies',tab_hw:'How it works',
 ov_p1:'ClaimSense estimates how much of a hospital bill you will pay out of pocket, given your policy terms: room rent limit, co-pay and sub-limits.',
 ov_why_h:'Why it matters',
 ov_why_p:'If your room costs more than the policy allows, insurers cut the whole bill in proportion, not just the room line. ClaimSense shows that hidden cut before you choose a room.',
 ov_open:'Open Estimator',
 t1h:'Instant estimate',t1p:'See your out-of-pocket share in seconds.',
 t2h:'Room comparison',t2p:'Compare room options before you get admitted.',
 t3h:'Claim checklists',t3p:'Documents, cashless steps and hospital questions.',
 t4h:'Assistant in your language',t4p:'Ask in English, Hindi or Marathi.',
 hw_1:'Pick a room rent per day and number of days.',
 hw_2:'Add other charges (surgery, medicines, tests).',
 hw_3:'If the room rent is above the policy limit, every covered charge is reduced by the same ratio (proportional deduction).',
 hw_4:'The co-pay percentage is applied on the remaining covered amount.',
 hw_5:'What is left is your estimated share.',
 hw_ex:'Example: room \u20B98,000 x 3 days, other charges \u20B91,20,000, limit \u20B95,000/day, co-pay 10% gives \u20B963,000. With a \u20B95,000 room it drops to \u20B913,500.',
 pol_load:'Loading policy...',
 pol_err:'Policy details could not be loaded from the server. The estimator still uses policy.json internally.',
 c_title:'ClaimSense Assistant',c_sub:'Estimates, claim help, hospital questions',
 c_ph:'Ask or type an estimate...',c_send:'Send',c_close:'Close',c_open:'Chat with ClaimSense Assistant',lang_l:'Language',
 chip1:'Try sample estimate',chip2:'Compare rooms',chip3:'Safe room rent',chip4:'Documents checklist',chip5:'Cashless steps',chip6:'Questions for hospital',chip7:'Copy last estimate',
 greet:'Hi! I can estimate your out-of-pocket share, compare rooms, explain deductions and guide you through the claim. Type "help" to see everything, or tap a chip below.',
 help:'I can:\n- Estimate your share: "room 8000 for 3 days, other 1,20,000, copay 10%"\n- Compare room options for your last estimate\n- Tell the safe room rent: "safe room rent"\n- Change limit/copay: "set limit 4000", "set copay 20%"\n- Explain proportional deduction\n- Share claim documents, cashless steps, questions for the hospital\n- Copy your last estimate\nAnything else goes to the local AI model.',
 docs:'Documents checklist (claim)\n1. Claim form (hospital + patient parts)\n2. Health card / policy number and ID proof\n3. Doctor admission note and discharge summary\n4. All final bills with itemised breakup\n5. Payment receipts\n6. Investigation and lab reports, prescriptions\n7. Pharmacy bills with prescriptions\n8. Cancelled cheque / bank details (reimbursement)\n9. FIR/MLC copy if it is an accident case',
 cash:'Cashless process\n1. Choose a network hospital\n2. At admission, show the health card at the insurance desk\n3. Hospital sends a pre-authorisation request\n4. Insurer approves (full or partial) - note the approved amount\n5. Pay only non-covered items and co-pay at discharge\nPlanned stay: ask for pre-auth 2-3 days before admission.\n\nReimbursement\n1. Pay the bills yourself\n2. Collect all original documents\n3. Submit to insurer or TPA within the deadline in your policy (usually 15-30 days after discharge)\n4. Follow up with the claim number',
 askh:'Ask the hospital before admission\n1. What is the room rent per day for my room category?\n2. Is there a cheaper room that stays within my insurance limit?\n3. Do ICU or OT charges depend on room category?\n4. Estimated total cost, and which items are non-payable?\n5. Surgeon, anaesthetist and package charges - are they fixed?\n6. Is the pre-authorisation done before admission?\n7. What deposit is needed?',
 why:'Proportional deduction\nIf your room rent per day is higher than the policy limit, the insurer reduces many other charges (doctor fees, nursing, OT etc.) in the same ratio, not just the room line.\nRatio = policy limit / actual room rent.\nExample: limit 5,000 and room 8,000 gives 62.5%, so the bill is cut to 62.5% before co-pay.',
 est:'Estimate',
 l_room:'Room: {0} x {1} days = {2}',l_other:'Other charges: {0}',l_total:'Total bill: {0}',
 l_cut:'Room rent is above your limit of {0}/day, so the whole bill is cut to {1}% (proportional deduction): -{2}',
 l_ok:'Room is within your {0}/day limit: no deduction.',
 l_copay:'Co-pay {0}%',l_ins:'Insurer pays: {0}',l_share:'Your share: {0}',
 l_days1:'(Days not given, assumed 1.)',
 l_tip:'Tip: a room at {0}/day would bring your share down to {1} (saves {2}).',
 upd:'Updated: {0}. This applies to my calculations in this chat.',u_lim:'Room rent limit = {0}/day',u_cop:'Co-pay = {0}%',
 noest:'No estimate yet. Type one first, for example: room 8000 for 3 days, other 1,20,000, copay 10%',
 copied:'Copied your last estimate to the clipboard.',
 needest:'Give me an estimate first (days and other charges), then I will compare rooms. Example: room 8000 for 3 days, other 1,20,000',
 cmp_h:'Room comparison ({0} days, other charges {1}, co-pay {2}%)',cmp_r:'{0}/day -> your share {1}',cmp_d:'(deduction)',
 safe:'Your room rent limit is {0}/day. Staying at or below it avoids proportional deduction. Above it, your whole bill shrinks by limit/room (for example {1}/day gives {2}%).\nAlso check if ICU/suite categories have their own limits in your policy.',
 think:'Thinking...',
 err:'I could not reach the local AI model ({0}). Make sure Ollama is running and "ollama list" shows {1}. Calculations and checklists still work without it. Type "help" to see what I can do offline.',
 langset:'Language: {0}',
 card_title:'Hospital bill estimate',card_share:'Your estimated share',
 lg_ins:'Insurer pays {0} ({1}%)',lg_you:'You pay {0} ({1}%)',
 r_room:'Room ({0} x {1} days)',r_other:'Other charges',r_total:'Total bill',
 r_cut:'Cut for room above limit ({0}/day limit)',r_copay:'Co-pay {0}%',r_ins:'Insurer pays',r_share:'Your share',
 card_note:'This is an estimate only. Your actual claim depends on your policy terms and the insurer.',
 card_by:'Made with ClaimSense',
 sh_h:'Share your estimate',
 sh_p:'Create an image of your estimate to save or send on WhatsApp.',
 sh_room:'Room rent per day',sh_days:'Days',sh_other:'Other charges',sh_copay:'Co-pay %',sh_limit:'Room rent limit per day',
 sh_dl:'Download image',sh_share:'Share',sh_copy:'Copy image',sh_fmt:'Image format',
 sh_done:'Image downloaded.',sh_copied:'Image copied.',
 sh_nocopy:'Your browser cannot copy images. Use Download instead.',
 sh_noshare:'Sharing is not available here, so the image was downloaded instead.',
 sh_bad:'Enter valid numbers first.',
 ch_save:'Save as image'
};
var D={hi:{},mr:{}};
function add(k,hi,mr){D.hi[E[k]]=hi;D.mr[E[k]]=mr;}
function addRaw(en,hi,mr){D.hi[en]=hi;D.mr[en]=mr;}

add('tab_ov','अवलोकन','आढावा');
add('tab_es','अनुमान','अंदाज');
add('tab_po','पॉलिसी','पॉलिसी');
add('tab_hw','यह कैसे काम करता है','हे कसे काम करते');
add('ov_p1','ClaimSense अनुमान लगाता है कि आपकी पॉलिसी की शर्तों (कमरे के किराये की सीमा, को-पे और सब-लिमिट) के हिसाब से अस्पताल के बिल का कितना हिस्सा आपको अपनी जेब से भरना होगा।','ClaimSense तुमच्या पॉलिसीच्या अटींनुसार (खोली भाड्याची मर्यादा, को-पे आणि सब-लिमिट) हॉस्पिटलच्या बिलातील किती रक्कम तुम्हाला स्वतःच्या खिशातून भरावी लागेल याचा अंदाज देते.');
add('ov_why_h','यह क्यों ज़रूरी है','हे का महत्त्वाचे आहे');
add('ov_why_p','अगर आपके कमरे का किराया पॉलिसी की सीमा से ज़्यादा है, तो बीमा कंपनी सिर्फ़ कमरे की लाइन में नहीं, पूरे बिल में उसी अनुपात में कटौती कर देती है। ClaimSense कमरा चुनने से पहले ही यह छिपी हुई कटौती दिखा देता है।','तुमच्या खोलीचे भाडे पॉलिसीच्या मर्यादेपेक्षा जास्त असेल तर विमा कंपनी फक्त खोलीच्या ओळीत नाही, तर संपूर्ण बिलात त्याच प्रमाणात कपात करते. खोली निवडण्यापूर्वीच ClaimSense ही लपलेली कपात दाखवते.');
add('ov_open','अनुमान खोलें','अंदाज उघडा');
add('t1h','तुरंत अनुमान','झटपट अंदाज');
add('t1p','कुछ ही सेकंड में अपनी जेब से लगने वाला खर्च देखें।','काही सेकंदांत तुमच्या खिशातून जाणारा खर्च पहा.');
add('t2h','कमरों की तुलना','खोल्यांची तुलना');
add('t2p','भर्ती होने से पहले कमरों के विकल्पों की तुलना करें।','दाखल होण्यापूर्वी खोल्यांच्या पर्यायांची तुलना करा.');
add('t3h','क्लेम चेकलिस्ट','क्लेम चेकलिस्ट');
add('t3p','दस्तावेज़, कैशलेस की प्रक्रिया और अस्पताल से पूछने वाले सवाल।','कागदपत्रे, कॅशलेस प्रक्रिया आणि हॉस्पिटलला विचारायचे प्रश्न.');
add('t4h','आपकी भाषा में सहायक','तुमच्या भाषेतील सहाय्यक');
add('t4p','अंग्रेज़ी, हिन्दी या मराठी में पूछें।','इंग्रजी, हिंदी किंवा मराठीत विचारा.');
add('hw_1','प्रति दिन का कमरे का किराया और दिनों की संख्या चुनें।','दररोजचे खोली भाडे आणि दिवसांची संख्या निवडा.');
add('hw_2','बाकी खर्च जोड़ें (सर्जरी, दवाइयाँ, जाँचें)।','इतर खर्च जोडा (शस्त्रक्रिया, औषधे, तपासण्या).');
add('hw_3','अगर कमरे का किराया पॉलिसी की सीमा से ज़्यादा है, तो हर कवर किए गए खर्च में उसी अनुपात में कटौती होती है (प्रोपोर्शनल डिडक्शन)।','खोलीचे भाडे पॉलिसीच्या मर्यादेपेक्षा जास्त असेल तर प्रत्येक कव्हर्ड खर्चात त्याच प्रमाणात कपात होते (प्रोपोर्शनल डिडक्शन).');
add('hw_4','बचे हुए कवर्ड अमाउंट पर को-पे प्रतिशत लगाया जाता है।','उरलेल्या कव्हर्ड रकमेवर को-पे टक्केवारी लावली जाते.');
add('hw_5','जो बचता है, वही आपका अनुमानित हिस्सा है।','जे उरते तोच तुमचा अंदाजे वाटा.');
add('hw_ex','उदाहरण: कमरा ₹8,000 × 3 दिन, अन्य खर्च ₹1,20,000, सीमा ₹5,000/दिन, को-पे 10% हो तो आपका हिस्सा ₹63,000 आता है। ₹5,000 का कमरा लेने पर यह ₹13,500 रह जाता है।','उदाहरण: खोली ₹8,000 × 3 दिवस, इतर खर्च ₹1,20,000, मर्यादा ₹5,000/दिवस, को-पे 10% असेल तर तुमचा वाटा ₹63,000 येतो. ₹5,000 ची खोली घेतल्यास तो ₹13,500 राहतो.');
add('pol_load','पॉलिसी लोड हो रही है...','पॉलिसी लोड होत आहे...');
add('pol_err','सर्वर से पॉलिसी की जानकारी लोड नहीं हो सकी। अनुमान फिर भी अंदर से policy.json का ही इस्तेमाल करता है।','सर्व्हरवरून पॉलिसीची माहिती लोड होऊ शकली नाही. तरीही अंदाज आतून policy.json चाच वापर करतो.');
add('c_title','ClaimSense सहायक','ClaimSense सहाय्यक');
add('c_sub','अनुमान, क्लेम में मदद, अस्पताल के सवाल','अंदाज, क्लेम मदत, हॉस्पिटलचे प्रश्न');
add('c_ph','पूछें या अनुमान लिखें...','विचारा किंवा अंदाज लिहा...');
add('c_send','भेजें','पाठवा');
add('c_close','बंद करें','बंद करा');
add('c_open','ClaimSense सहायक से बात करें','ClaimSense सहाय्यकाशी बोला');
add('lang_l','भाषा','भाषा');
add('chip1','नमूना अनुमान आज़माएँ','नमुना अंदाज पहा');
add('chip2','कमरों की तुलना','खोल्यांची तुलना');
add('chip3','सुरक्षित कमरे का किराया','सुरक्षित खोली भाडे');
add('chip4','दस्तावेज़ों की सूची','कागदपत्रांची यादी');
add('chip5','कैशलेस की प्रक्रिया','कॅशलेस प्रक्रिया');
add('chip6','अस्पताल से सवाल','हॉस्पिटलला प्रश्न');
add('chip7','पिछला अनुमान कॉपी करें','मागील अंदाज कॉपी करा');
add('greet','नमस्ते! मैं आपकी जेब से लगने वाला खर्च निकाल सकता हूँ, कमरों की तुलना कर सकता हूँ, कटौती समझा सकता हूँ और क्लेम में मार्गदर्शन दे सकता हूँ। सब कुछ देखने के लिए "help" लिखें, या नीचे दिए बटन दबाएँ।','नमस्कार! मी तुमच्या खिशातून जाणारा खर्च काढू शकतो, खोल्यांची तुलना करू शकतो, कपात समजावू शकतो आणि क्लेममध्ये मार्गदर्शन करू शकतो. सर्व पाहण्यासाठी "help" लिहा किंवा खालील बटणे दाबा.');
add('help','मैं ये कर सकता हूँ:\n- आपका हिस्सा निकालना: "room 8000 for 3 days, other 1,20,000, copay 10%"\n- पिछले अनुमान के लिए कमरों की तुलना\n- सुरक्षित कमरे का किराया बताना: "safe room rent"\n- सीमा/को-पे बदलना: "set limit 4000", "set copay 20%"\n- प्रोपोर्शनल डिडक्शन समझाना\n- क्लेम के दस्तावेज़, कैशलेस की प्रक्रिया, अस्पताल से पूछने वाले सवाल\n- पिछला अनुमान कॉपी करना\nबाकी सवाल लोकल AI मॉडल को जाते हैं।','मी हे करू शकतो:\n- तुमचा वाटा काढणे: "room 8000 for 3 days, other 1,20,000, copay 10%"\n- मागील अंदाजासाठी खोल्यांची तुलना\n- सुरक्षित खोली भाडे सांगणे: "safe room rent"\n- मर्यादा/को-पे बदलणे: "set limit 4000", "set copay 20%"\n- प्रोपोर्शनल डिडक्शन समजावणे\n- क्लेमची कागदपत्रे, कॅशलेस प्रक्रिया, हॉस्पिटलला विचारायचे प्रश्न\n- मागील अंदाज कॉपी करणे\nइतर प्रश्न लोकल AI मॉडेलकडे जातात.');
add('docs','क्लेम के दस्तावेज़ों की सूची\n1. क्लेम फ़ॉर्म (अस्पताल और मरीज़ दोनों के हिस्से)\n2. हेल्थ कार्ड / पॉलिसी नंबर और पहचान पत्र\n3. डॉक्टर का एडमिशन नोट और डिस्चार्ज समरी\n4. सभी अंतिम बिल (खर्च के पूरे ब्योरे के साथ)\n5. भुगतान की रसीदें\n6. जाँच और लैब रिपोर्ट, पर्चे\n7. पर्चे के साथ फ़ार्मेसी के बिल\n8. कैंसिल्ड चेक / बैंक की जानकारी (रीइम्बर्समेंट के लिए)\n9. दुर्घटना का मामला हो तो FIR/MLC की कॉपी','क्लेमसाठी कागदपत्रांची यादी\n1. क्लेम फॉर्म (हॉस्पिटल आणि रुग्ण दोघांचे भाग)\n2. हेल्थ कार्ड / पॉलिसी क्रमांक आणि ओळखपत्र\n3. डॉक्टरांची अ‍ॅडमिशन नोट आणि डिस्चार्ज समरी\n4. सर्व अंतिम बिले (खर्चाच्या तपशीलासह)\n5. पैसे भरल्याच्या पावत्या\n6. तपासणी आणि लॅब रिपोर्ट, प्रिस्क्रिप्शन\n7. प्रिस्क्रिप्शनसह फार्मसी बिले\n8. रद्द केलेला चेक / बँक तपशील (रीइम्बर्समेंटसाठी)\n9. अपघाताचे प्रकरण असल्यास FIR/MLC ची प्रत');
add('cash','कैशलेस प्रक्रिया\n1. नेटवर्क अस्पताल चुनें\n2. भर्ती के समय इंश्योरेंस डेस्क पर हेल्थ कार्ड दिखाएँ\n3. अस्पताल प्री-ऑथराइज़ेशन का अनुरोध भेजता है\n4. बीमा कंपनी मंज़ूरी देती है (पूरी या आंशिक) - मंज़ूर राशि नोट कर लें\n5. डिस्चार्ज पर सिर्फ़ नॉन-कवर्ड चीज़ों और को-पे का भुगतान करें\nपहले से तय भर्ती हो तो 2-3 दिन पहले प्री-ऑथ के लिए कहें।\n\nरीइम्बर्समेंट\n1. बिल खुद भरें\n2. सभी मूल दस्तावेज़ इकट्ठा करें\n3. पॉलिसी में दी गई समय-सीमा के भीतर (आमतौर पर डिस्चार्ज के 15-30 दिन) बीमा कंपनी या TPA को जमा करें\n4. क्लेम नंबर के साथ फ़ॉलो-अप करें','कॅशलेस प्रक्रिया\n1. नेटवर्क हॉस्पिटल निवडा\n2. दाखल होताना इन्शुरन्स डेस्कवर हेल्थ कार्ड दाखवा\n3. हॉस्पिटल प्री-ऑथोरायझेशनची विनंती पाठवते\n4. विमा कंपनी मंजुरी देते (पूर्ण किंवा अंशतः) - मंजूर रक्कम लिहून ठेवा\n5. डिस्चार्जच्या वेळी फक्त नॉन-कव्हर्ड गोष्टी आणि को-पे भरा\nआधीपासून ठरलेले दाखल होणे असल्यास 2-3 दिवस आधी प्री-ऑथ मागा.\n\nरीइम्बर्समेंट\n1. बिले स्वतः भरा\n2. सर्व मूळ कागदपत्रे गोळा करा\n3. पॉलिसीमध्ये दिलेल्या मुदतीत (साधारणपणे डिस्चार्जनंतर 15-30 दिवस) विमा कंपनी किंवा TPA कडे सादर करा\n4. क्लेम क्रमांकासह पाठपुरावा करा');
add('askh','भर्ती से पहले अस्पताल से पूछें\n1. मेरी श्रेणी के कमरे का प्रति दिन किराया कितना है?\n2. क्या कोई सस्ता कमरा है जो मेरी बीमा सीमा के अंदर आए?\n3. क्या ICU या OT के चार्ज कमरे की श्रेणी पर निर्भर करते हैं?\n4. कुल अनुमानित खर्च कितना है, और कौन सी चीज़ें नॉन-पेएबल हैं?\n5. सर्जन, एनेस्थेटिस्ट और पैकेज के चार्ज - क्या ये तय हैं?\n6. क्या भर्ती से पहले प्री-ऑथराइज़ेशन हो चुका है?\n7. कितना डिपॉज़िट चाहिए?','दाखल होण्यापूर्वी हॉस्पिटलला विचारा\n1. माझ्या श्रेणीतील खोलीचे दररोजचे भाडे किती आहे?\n2. माझ्या विमा मर्यादेत बसणारी स्वस्त खोली आहे का?\n3. ICU किंवा OT चे शुल्क खोलीच्या श्रेणीवर अवलंबून असते का?\n4. एकूण अंदाजे खर्च किती आणि कोणत्या गोष्टी नॉन-पेएबल आहेत?\n5. सर्जन, भूलतज्ज्ञ आणि पॅकेजचे शुल्क - हे निश्चित आहे का?\n6. दाखल होण्यापूर्वी प्री-ऑथोरायझेशन झाले आहे का?\n7. किती डिपॉझिट लागेल?');
add('why','प्रोपोर्शनल डिडक्शन\nअगर आपके कमरे का प्रति दिन किराया पॉलिसी की सीमा से ज़्यादा है, तो बीमा कंपनी सिर्फ़ कमरे की लाइन नहीं, बल्कि कई दूसरे खर्च (डॉक्टर की फ़ीस, नर्सिंग, OT आदि) भी उसी अनुपात में घटा देती है।\nअनुपात = पॉलिसी की सीमा / कमरे का असली किराया।\nउदाहरण: सीमा 5,000 और कमरा 8,000 हो तो अनुपात 62.5% बनता है, यानी को-पे से पहले बिल घटकर 62.5% रह जाता है।','प्रोपोर्शनल डिडक्शन\nतुमच्या खोलीचे दररोजचे भाडे पॉलिसीच्या मर्यादेपेक्षा जास्त असेल तर विमा कंपनी फक्त खोलीच्या ओळीत नाही, तर इतर अनेक खर्चातही (डॉक्टर फी, नर्सिंग, OT इ.) त्याच प्रमाणात कपात करते.\nप्रमाण = पॉलिसी मर्यादा / खोलीचे प्रत्यक्ष भाडे.\nउदाहरण: मर्यादा 5,000 आणि खोली 8,000 असेल तर प्रमाण 62.5% होते, म्हणजे को-पे आधी बिल 62.5% पर्यंत कमी होते.');
add('est','अनुमान','अंदाज');
add('l_room','कमरा: {0} × {1} दिन = {2}','खोली: {0} × {1} दिवस = {2}');
add('l_other','अन्य खर्च: {0}','इतर खर्च: {0}');
add('l_total','कुल बिल: {0}','एकूण बिल: {0}');
add('l_cut','कमरे का किराया आपकी {0}/दिन की सीमा से ज़्यादा है, इसलिए पूरा बिल घटकर {1}% रह जाता है (प्रोपोर्शनल डिडक्शन): -{2}','खोलीचे भाडे तुमच्या {0}/दिवस मर्यादेपेक्षा जास्त आहे, म्हणून संपूर्ण बिल {1}% पर्यंत कमी होते (प्रोपोर्शनल डिडक्शन): -{2}');
add('l_ok','कमरा आपकी {0}/दिन की सीमा के अंदर है: कोई कटौती नहीं।','खोली तुमच्या {0}/दिवस मर्यादेत आहे: कोणतीही कपात नाही.');
add('l_copay','को-पे {0}%','को-पे {0}%');
add('l_ins','बीमा कंपनी देगी: {0}','विमा कंपनी देईल: {0}');
add('l_share','आपका हिस्सा: {0}','तुमचा वाटा: {0}');
add('l_days1','(दिन नहीं बताए गए, 1 दिन माना गया।)','(दिवस दिले नाहीत, 1 दिवस गृहीत धरला.)');
add('l_tip','सुझाव: {0}/दिन का कमरा लेने पर आपका हिस्सा घटकर {1} रह जाएगा ({2} की बचत)।','सूचना: {0}/दिवस भाड्याची खोली घेतल्यास तुमचा वाटा {1} पर्यंत कमी होईल ({2} बचत).');
add('upd','अपडेट किया: {0}। यह इस चैट की मेरी गणनाओं पर लागू होगा।','अपडेट केले: {0}. हे या चॅटमधील माझ्या गणनांना लागू होईल.');
add('u_lim','कमरे के किराये की सीमा = {0}/दिन','खोली भाड्याची मर्यादा = {0}/दिवस');
add('u_cop','को-पे = {0}%','को-पे = {0}%');
add('noest','अभी कोई अनुमान नहीं है। पहले एक लिखें, जैसे: room 8000 for 3 days, other 1,20,000, copay 10%','अजून अंदाज नाही. आधी एक लिहा, उदा.: room 8000 for 3 days, other 1,20,000, copay 10%');
add('copied','आपका पिछला अनुमान क्लिपबोर्ड पर कॉपी हो गया।','तुमचा मागील अंदाज क्लिपबोर्डवर कॉपी झाला.');
add('needest','पहले एक अनुमान दीजिए (दिन और अन्य खर्च), फिर मैं कमरों की तुलना करूँगा। जैसे: room 8000 for 3 days, other 1,20,000','आधी एक अंदाज द्या (दिवस आणि इतर खर्च), मग मी खोल्यांची तुलना करतो. उदा.: room 8000 for 3 days, other 1,20,000');
add('cmp_h','कमरों की तुलना ({0} दिन, अन्य खर्च {1}, को-पे {2}%)','खोल्यांची तुलना ({0} दिवस, इतर खर्च {1}, को-पे {2}%)');
add('cmp_r','{0}/दिन -> आपका हिस्सा {1}','{0}/दिवस -> तुमचा वाटा {1}');
add('cmp_d','(कटौती)','(कपात)');
add('safe','आपके कमरे के किराये की सीमा {0}/दिन है। इससे कम या बराबर रहने पर प्रोपोर्शनल डिडक्शन नहीं लगता। इससे ऊपर जाने पर पूरा बिल सीमा/कमरे के अनुपात में घट जाता है (जैसे {1}/दिन पर {2}%)।\nयह भी देखें कि आपकी पॉलिसी में ICU/सुइट श्रेणियों की अलग सीमा तो नहीं है।','तुमच्या खोली भाड्याची मर्यादा {0}/दिवस आहे. त्याखाली किंवा तितकेच राहिल्यास प्रोपोर्शनल डिडक्शन लागत नाही. त्यावर गेल्यास संपूर्ण बिल मर्यादा/खोली या प्रमाणात कमी होते (उदा. {1}/दिवस वर {2}%).\nतुमच्या पॉलिसीमध्ये ICU/सुईट प्रकारांसाठी वेगळी मर्यादा आहे का तेही तपासा.');
add('think','सोच रहा हूँ...','विचार करत आहे...');
add('err','मैं लोकल AI मॉडल तक नहीं पहुँच सका ({0})। देखें कि Ollama चल रहा है और "ollama list" में {1} दिख रहा है। गणनाएँ और चेकलिस्ट इसके बिना भी चलती हैं। ऑफ़लाइन मैं क्या कर सकता हूँ, यह देखने के लिए "help" लिखें।','मला लोकल AI मॉडेलशी संपर्क साधता आला नाही ({0}). Ollama सुरू आहे आणि "ollama list" मध्ये {1} दिसते आहे याची खात्री करा. गणना आणि चेकलिस्ट त्याशिवायही चालतात. ऑफलाइन मी काय करू शकतो ते पाहण्यासाठी "help" लिहा.');
add('langset','भाषा: {0}','भाषा: {0}');
add('card_title','अस्पताल बिल का अनुमान','हॉस्पिटल बिलाचा अंदाज');
add('card_share','आपका अनुमानित हिस्सा','तुमचा अंदाजे वाटा');
add('lg_ins','बीमा कंपनी देगी {0} ({1}%)','विमा कंपनी देईल {0} ({1}%)');
add('lg_you','आप देंगे {0} ({1}%)','तुम्ही द्याल {0} ({1}%)');
add('r_room','कमरा ({0} × {1} दिन)','खोली ({0} × {1} दिवस)');
add('r_other','अन्य खर्च','इतर खर्च');
add('r_total','कुल बिल','एकूण बिल');
add('r_cut','सीमा से ज़्यादा कमरे पर कटौती (सीमा {0}/दिन)','मर्यादेपेक्षा जास्त खोलीमुळे कपात (मर्यादा {0}/दिवस)');
add('r_copay','को-पे {0}%','को-पे {0}%');
add('r_ins','बीमा कंपनी देगी','विमा कंपनी देईल');
add('r_share','आपका हिस्सा','तुमचा वाटा');
add('card_note','यह सिर्फ़ एक अनुमान है। असली क्लेम आपकी पॉलिसी की शर्तों और बीमा कंपनी पर निर्भर करता है।','हा फक्त अंदाज आहे. प्रत्यक्ष क्लेम तुमच्या पॉलिसीच्या अटी आणि विमा कंपनीवर अवलंबून असतो.');
add('card_by','ClaimSense से बनाया गया','ClaimSense ने तयार केले');
add('sh_h','अपना अनुमान साझा करें','तुमचा अंदाज शेअर करा');
add('sh_p','अनुमान की इमेज बनाएँ, जिसे आप सेव कर सकें या WhatsApp पर भेज सकें।','अंदाजाची इमेज तयार करा, जी तुम्ही सेव्ह करू शकता किंवा WhatsApp वर पाठवू शकता.');
add('sh_room','प्रति दिन कमरे का किराया','दररोजचे खोली भाडे');
add('sh_days','दिन','दिवस');
add('sh_other','अन्य खर्च','इतर खर्च');
add('sh_copay','को-पे %','को-पे %');
add('sh_limit','प्रति दिन किराये की सीमा','दररोजच्या भाड्याची मर्यादा');
add('sh_dl','इमेज डाउनलोड करें','इमेज डाउनलोड करा');
add('sh_share','शेयर करें','शेअर करा');
add('sh_copy','इमेज कॉपी करें','इमेज कॉपी करा');
add('sh_fmt','इमेज फ़ॉर्मैट','इमेज फॉरमॅट');
add('sh_done','इमेज डाउनलोड हो गई।','इमेज डाउनलोड झाली.');
add('sh_copied','इमेज कॉपी हो गई।','इमेज कॉपी झाली.');
add('sh_nocopy','आपका ब्राउज़र इमेज कॉपी नहीं कर सकता। इसकी जगह डाउनलोड करें।','तुमचा ब्राउझर इमेज कॉपी करू शकत नाही. त्याऐवजी डाउनलोड करा.');
add('sh_noshare','यहाँ शेयर करना उपलब्ध नहीं है, इसलिए इमेज डाउनलोड कर दी गई।','येथे शेअरिंग उपलब्ध नाही, म्हणून इमेज डाउनलोड केली.');
add('sh_bad','पहले सही संख्याएँ भरें।','आधी योग्य संख्या भरा.');
add('ch_save','इमेज के रूप में सेव करें','इमेज म्हणून सेव्ह करा');

/* labels that may already exist on the Estimator page; run csMissing() in the console to list the rest */
addRaw('Your estimated share','आपका अनुमानित हिस्सा','तुमचा अंदाजे वाटा');
addRaw('Room rent per day','प्रति दिन कमरे का किराया','दररोजचे खोली भाडे');
addRaw('Room rent','कमरे का किराया','खोली भाडे');
addRaw('Days','दिन','दिवस');
addRaw('Other charges','अन्य खर्च','इतर खर्च');
addRaw('Choose covered room','कवर्ड कमरा चुनें','कव्हर्ड खोली निवडा');
addRaw('Co-pay','को-पे','को-पे');
addRaw('Total bill','कुल बिल','एकूण बिल');

/* ---------- language state and translation layer ---------- */
var NAMES={en:'English',hi:'हिन्दी',mr:'मराठी'};
var LLMN={en:'English',hi:'Hindi',mr:'Marathi'};
var lang='en';
try{
  var sv=localStorage.getItem('cs_lang');
  if(sv&&NAMES.hasOwnProperty(sv))lang=sv;
  else{var nl=(navigator.language||'').slice(0,2);if(NAMES.hasOwnProperty(nl))lang=nl;}
}catch(e){}

function T(s){
  var a=[].slice.call(arguments,1),d=(D[lang]&&D[lang][s])||s;
  return d.replace(/\{(\d+)\}/g,function(m,i){return a[i];});
}
var recs=new WeakMap();
function tn(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode()))list.push(n);
  list.forEach(function(n){
    var p=n.parentNode;
    if(!p||/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT|OPTION)$/.test(p.nodeName))return;
    if(p.closest&&p.closest('.cs-u'))return;
    var rec=recs.get(n),base;
    if(rec&&n.nodeValue===rec.out)base=rec.base;else{base=n.nodeValue;rec=null;}
    var key=base.trim();
    var tr=(lang!=='en'&&key)?(D[lang]||{})[key]:null;
    if(tr){
      var out=base.replace(key,function(){return tr;});
      if(n.nodeValue!==out)n.nodeValue=out;
      recs.set(n,{base:base,out:out});
    }else if(rec){
      n.nodeValue=base;recs.delete(n);
    }
  });
}
function attrs(){
  [].forEach.call(document.querySelectorAll('[data-ph]'),function(e){e.placeholder=T(e.getAttribute('data-ph'));});
  [].forEach.call(document.querySelectorAll('[data-tt]'),function(e){var s=T(e.getAttribute('data-tt'));e.title=s;e.setAttribute('aria-label',s);});
}
window.csMissing=function(){
  var seen={},out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n;
  while((n=w.nextNode())){
    var p=n.parentNode,t=n.nodeValue.trim();
    if(!t||/^(SCRIPT|STYLE|OPTION)$/.test(p.nodeName)||(p.closest&&p.closest('#cs-panel')))continue;
    if(/^[\d\s.,%\u20B9+\-\u2212x\u00D7/]+$/.test(t))continue;
    var base=recs.has(n)?recs.get(n).base.trim():t;
    if(!D.hi[base]&&!seen[base]){seen[base]=1;out.push(base);}
  }
  console.log(out.join('\n'));return out;
};

/* ---------- build the page chrome ---------- */
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
var nav=document.querySelector('nav');
if(!nav)return;

var logo=nav.querySelector('.logo');
if(logo){logo.innerHTML=mark()+'<span class="wm">ClaimSense</span>';logo.setAttribute('aria-label','ClaimSense');}

var btns=nav.querySelectorAll('.tabs button');
if(btns.length<4)return;
var tabIcons=[I.overview,I.calc,I.policy,I.how],tabKeys=['tab_ov','tab_es','tab_po','tab_hw'];
[].forEach.call(btns,function(b,i){b.innerHTML=tabIcons[i]+'<span>'+E[tabKeys[i]]+'</span>';b.setAttribute('role','tab');});

/* language picker */
var lw=el('div','lang',I.globe);
var sel=el('select');sel.setAttribute('data-tt',E.lang_l);
['en','hi','mr'].forEach(function(c){var o=el('option');o.value=c;o.textContent=NAMES[c];sel.appendChild(o);});
lw.appendChild(sel);nav.appendChild(lw);

/* wrap the existing page so it can be one tab */
function collect(from){var a=[],n=from.nextElementSibling;
  while(n){if(!/^(SCRIPT|STYLE|LINK)$/.test(n.tagName))a.push(n);n=n.nextElementSibling;}return a;}
var kids=collect(nav);
if(!kids.length)kids=collect(nav.parentElement);
if(!kids.length)return;
var est=el('div');est.id='view-estimator';
kids[0].parentNode.insertBefore(est,kids[0]);
kids.forEach(function(k){est.appendChild(k);});

function pane(id,html){var d=el('div','pane',html);d.id=id;d.style.display='none';est.parentNode.insertBefore(d,est.nextSibling);return d;}

var overview=pane('view-overview',
  '<div class="hero">'+mark()+'<div><h2>'+E.tab_ov+'</h2><p>'+E.ov_p1+'</p></div></div>'+
  '<div class="tiles">'+
    '<div class="tile"><span class="ti">'+I.calc+'</span><h3>'+E.t1h+'</h3><p>'+E.t1p+'</p></div>'+
    '<div class="tile"><span class="ti">'+I.bars+'</span><h3>'+E.t2h+'</h3><p>'+E.t2p+'</p></div>'+
    '<div class="tile"><span class="ti">'+I.list+'</span><h3>'+E.t3h+'</h3><p>'+E.t3p+'</p></div>'+
    '<div class="tile"><span class="ti">'+I.globe+'</span><h3>'+E.t4h+'</h3><p>'+E.t4p+'</p></div>'+
  '</div>'+
  '<div class="card"><b>'+E.ov_why_h+'</b><p>'+E.ov_why_p+'</p></div>'+
  '<button class="btn-main" id="goEst"><span>'+E.ov_open+'</span>'+I.go+'</button>');
var how=pane('view-how',
  '<h2>'+E.tab_hw+'</h2><div class="card"><ol class="steps"><li>'+E.hw_1+'</li><li>'+E.hw_2+'</li><li>'+E.hw_3+'</li><li>'+E.hw_4+'</li><li>'+E.hw_5+'</li></ol></div>'+
  '<div class="card"><p>'+E.hw_ex+'</p></div>');
var pol=pane('view-policies','<h2>'+E.tab_po+'</h2><div class="card" id="polBody">'+E.pol_load+'</div>');

/* policy table */
function renderPolicy(o){
  var rows='';
  (function walk(x,p){
    Object.keys(x).forEach(function(k){
      var v=x[k],key=(p?p+' / ':'')+k.replace(/_/g,' ');
      if(v&&typeof v==='object'&&!Array.isArray(v))walk(v,key);
      else rows+='<tr><th>'+key+'</th><td>'+(Array.isArray(v)?v.join(', '):v)+'</td></tr>';
    });
  })(o,'');
  document.getElementById('polBody').innerHTML='<table>'+rows+'</table>';
}
var S={limit:5000,copay:10,last:null,hist:[],model:'gemma4:e4b'};
function applyPolicyDefaults(o){
  (function walk(x){Object.keys(x).forEach(function(k){
    var v=x[k];
    if(v&&typeof v==='object'&&!Array.isArray(v)){walk(v);return;}
    if(typeof v!=='number')return;
    if(/co-?pay/i.test(k))S.copay=v<=1?v*100:v;
    else if(/(room|rent).*(limit|cap|max)|(limit|cap|max).*(room|rent)|per.?day/i.test(k))S.limit=v;
  });})(o);
}
(function tryNext(urls,i){
  if(i>=urls.length){document.getElementById('polBody').textContent=E.pol_err;return;}
  fetch(urls[i]).then(function(r){if(!r.ok)throw 0;return r.json();})
    .then(function(o){renderPolicy(o);applyPolicyDefaults(o);if(typeof syncPolicy==='function')syncPolicy();})
    .catch(function(){tryNext(urls,i+1);});
})(['/policy.json','/api/policy','policy.json'],0);

/* tab switching */
var views=[overview,est,pol,how],hashes=['overview','estimator','policies','how'];
function show(i){
  views.forEach(function(v,j){v.style.display=(j===i)?'':'none';if(j===i&&v!==est){v.classList.remove('pane-in');void v.offsetWidth;v.classList.add('pane-in');}});
  [].forEach.call(btns,function(b,j){b.classList.toggle('on',j===i);b.setAttribute('aria-selected',j===i?'true':'false');});
  try{history.replaceState(null,'','#'+hashes[i]);}catch(e){}
}
[].forEach.call(btns,function(b,i){b.addEventListener('click',function(){show(i);});});
document.getElementById('goEst').addEventListener('click',function(){show(1);});
var h0=hashes.indexOf((location.hash||'').replace('#',''));
show(h0<0?1:h0);

/* favicon and browser colour */
(function(){
  var svg=mark(5.5).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ');
  [].forEach.call(document.querySelectorAll('link[rel~="icon"]'),function(x){x.remove();});
  var l=el('link');l.rel='icon';l.type='image/svg+xml';l.href='data:image/svg+xml,'+encodeURIComponent(svg);document.head.appendChild(l);
  var m=document.querySelector('meta[name="theme-color"]')||el('meta');m.name='theme-color';m.content='#0B5D5E';document.head.appendChild(m);
})();

/* ---------- assistant ---------- */
function rs(n){return RS+Math.round(n).toLocaleString('en-IN');}
var NUM='[\u20B9rs.\\s]*(\\d[\\d,]*(?:\\.\\d+)?)\\s*(k|lakh|lac)?';
function pick(re,t){var m=t.match(re);if(!m)return NaN;var v=parseFloat(m[1].replace(/,/g,''));var u=(m[2]||'').toLowerCase();if(u==='k')v*=1000;else if(u)v*=100000;return v;}
function calc(room,days,other,copay,limit){
  var total=room*days+other,ratio=Math.min(1,limit/room);
  var after=total*ratio,insurer=after*(1-copay/100);
  return {room:room,days:days,other:other,copay:copay,limit:limit,total:total,ratio:ratio,deducted:total-after,insurer:insurer,patient:total-insurer};
}
function fmt(r){
  var s=T(E.est)+'\n'+T(E.l_room,rs(r.room),r.days,rs(r.room*r.days))+'\n'+T(E.l_other,rs(r.other))+'\n'+T(E.l_total,rs(r.total))+'\n';
  s+=r.ratio<1?T(E.l_cut,rs(r.limit),(r.ratio*100).toFixed(1),rs(r.deducted))+'\n':T(E.l_ok,rs(r.limit))+'\n';
  s+=T(E.l_copay,r.copay)+'\n'+T(E.l_ins,rs(r.insurer))+'\n'+T(E.l_share,rs(r.patient));
  return s;
}

/* ---------- shareable estimate image (PNG / JPG) ---------- */
var FONT='"Nirmala UI","Noto Sans Devanagari","Segoe UI",system-ui,Arial,sans-serif';
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function wrapLines(ctx,text,maxW){
  var out=[],line='';
  text.split(/\s+/).forEach(function(w){var t=line?line+' '+w:w;if(line&&ctx.measureText(t).width>maxW){out.push(line);line=w;}else line=t;});
  if(line)out.push(line);return out;
}
function drawCard(cv,r){
  var W=1080,H=1560,M=64,CW=W-2*M;
  cv.width=W;cv.height=H;
  var ctx=cv.getContext('2d');
  ctx.fillStyle='#FBFAF8';ctx.fillRect(0,0,W,H);
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.save();ctx.translate(M,64);ctx.scale(1.2,1.2);
  ctx.save();ctx.clip(new Path2D(SH));ctx.fillStyle='#0B5D5E';ctx.fillRect(0,0,64,64);ctx.fillStyle='#F2A33A';ctx.fillRect(0,39,64,25);ctx.fillStyle='#fff';ctx.fillRect(0,38,64,2);ctx.restore();
  ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(20,24);ctx.lineTo(28,32);ctx.lineTo(43,17);ctx.stroke();
  ctx.restore();
  ctx.fillStyle='#12302F';ctx.font='700 42px '+FONT;ctx.fillText('ClaimSense',M+98,116);
  ctx.textAlign='right';ctx.fillStyle='#7a7a75';ctx.font='400 26px '+FONT;
  var loc={en:'en-IN',hi:'hi-IN',mr:'mr-IN'}[lang];
  var ds='';try{ds=new Date().toLocaleDateString(loc,{day:'numeric',month:'short',year:'numeric'});}catch(e){ds=new Date().toDateString();}
  ctx.fillText(ds,W-M,114);
  ctx.textAlign='left';
  ctx.fillStyle='#5b6b6a';ctx.font='500 34px '+FONT;ctx.fillText(T(E.card_title),M,240);
  ctx.fillStyle='#12302F';ctx.font='500 38px '+FONT;ctx.fillText(T(E.card_share),M,310);
  var big=rs(r.patient),fs=150;ctx.font='700 '+fs+'px '+FONT;
  while(ctx.measureText(big).width>CW&&fs>60){fs-=6;ctx.font='700 '+fs+'px '+FONT;}
  ctx.fillText(big,M,310+fs*0.95);

  var by=500,bh=44,part=r.total>0?r.insurer/r.total:0;
  ctx.save();rr(ctx,M,by,CW,bh,22);ctx.clip();ctx.fillStyle='#F2A33A';ctx.fillRect(M,by,CW,bh);ctx.fillStyle='#0B5D5E';ctx.fillRect(M,by,CW*part,bh);ctx.restore();
  ctx.font='400 28px '+FONT;
  function leg(y,col,txt){ctx.fillStyle=col;rr(ctx,M,y-20,22,22,5);ctx.fill();ctx.fillStyle='#12302F';ctx.fillText(txt,M+38,y);}
  var pi=Math.round(part*100);
  leg(602,'#0B5D5E',T(E.lg_ins,rs(r.insurer),pi));
  leg(646,'#F2A33A',T(E.lg_you,rs(r.patient),100-pi));

  var cpAmt=r.total*r.ratio*r.copay/100;
  var rows=[[T(E.r_room,rs(r.room),r.days),rs(r.room*r.days)],[T(E.r_other),rs(r.other)],[T(E.r_total),rs(r.total)]];
  if(r.ratio<1)rows.push([T(E.r_cut,rs(r.limit)),'-'+rs(r.deducted)]);
  if(r.copay>0)rows.push([T(E.r_copay,r.copay),'-'+rs(cpAmt)]);
  rows.push([T(E.r_ins),rs(r.insurer)]);
  var y=730;
  rows.forEach(function(row){
    var f=30;ctx.font='400 '+f+'px '+FONT;
    while(ctx.measureText(row[0]).width>CW-220&&f>20){f-=2;ctx.font='400 '+f+'px '+FONT;}
    ctx.textAlign='left';ctx.fillStyle='#3d4a49';ctx.fillText(row[0],M,y);
    ctx.textAlign='right';ctx.font='600 30px '+FONT;ctx.fillStyle='#12302F';ctx.fillText(row[1],W-M,y);
    ctx.strokeStyle='#E7E5E1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,y+20);ctx.lineTo(W-M,y+20);ctx.stroke();
    y+=62;
  });
  y+=6;
  ctx.textAlign='left';ctx.fillStyle='#12302F';ctx.font='700 38px '+FONT;ctx.fillText(T(E.r_share),M,y);
  ctx.textAlign='right';ctx.fillText(rs(r.patient),W-M,y);ctx.textAlign='left';

  if(r.ratio<1){
    var alt=calc(r.limit,r.days,r.other,r.copay,r.limit);
    var tip=T(E.l_tip,rs(r.limit),rs(alt.patient),rs(r.patient-alt.patient));
    ctx.font='400 28px '+FONT;
    var ls=wrapLines(ctx,tip,CW-56),boxH=ls.length*40+40,ty=y+50;
    ctx.fillStyle='#FCEFD8';rr(ctx,M,ty,CW,boxH,18);ctx.fill();
    ctx.fillStyle='#6b4a10';
    ls.forEach(function(l,i){ctx.fillText(l,M+28,ty+50+i*40);});
  }

  ctx.strokeStyle='#E7E5E1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M,1380);ctx.lineTo(W-M,1380);ctx.stroke();
  ctx.fillStyle='#7a7a75';ctx.font='400 24px '+FONT;
  wrapLines(ctx,T(E.card_note),CW).slice(0,3).forEach(function(l,i){ctx.fillText(l,M,1422+i*32);});
  ctx.fillStyle='#0B5D5E';ctx.font='600 26px '+FONT;ctx.fillText(T(E.card_by),M,1520);
}
function stamp(){var d=new Date();return d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2);}
function fname(fmt){return 'claimsense-estimate-'+stamp()+'.'+(fmt==='jpg'?'jpg':'png');}
function makeBlob(r,fmt,cb){var cv=document.createElement('canvas');drawCard(cv,r);cv.toBlob(cb,fmt==='jpg'?'image/jpeg':'image/png',0.92);}
function saveBlob(b,fmt){var a=document.createElement('a'),u=URL.createObjectURL(b);a.href=u;a.download=fname(fmt);document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},4000);}
function doDownload(r,fmt,note){makeBlob(r,fmt,function(b){if(!b)return;saveBlob(b,fmt);note(T(E.sh_done));});}
function doShare(r,fmt,note){
  makeBlob(r,fmt,function(b){
    if(!b)return;
    var f=null;try{f=new File([b],fname(fmt),{type:b.type});}catch(e){}
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){
      navigator.share({files:[f],title:'ClaimSense',text:T(E.l_share,rs(r.patient))}).catch(function(){});
    }else{saveBlob(b,fmt);note(T(E.sh_noshare));}
  });
}
function doCopy(r,note){
  if(!(navigator.clipboard&&window.ClipboardItem)){note(T(E.sh_nocopy));return;}
  makeBlob(r,'png',function(b){
    navigator.clipboard.write([new ClipboardItem({'image/png':b})]).then(function(){note(T(E.sh_copied));}).catch(function(){note(T(E.sh_nocopy));});
  });
}

/* share panel at the bottom of the Estimator tab */
var shp=el('section','share-panel');shp.id='sharePanel';
shp.innerHTML='<h3>'+E.sh_h+'</h3><p class="sh-sub">'+E.sh_p+'</p><div class="sh-grid"><div class="sh-form">'+
  '<label><span>'+E.sh_room+'</span><input id="shRoom" inputmode="decimal" value="8000"></label>'+
  '<label><span>'+E.sh_days+'</span><input id="shDays" inputmode="numeric" value="3"></label>'+
  '<label><span>'+E.sh_other+'</span><input id="shOther" inputmode="decimal" value="1,20,000"></label>'+
  '<label><span>'+E.sh_copay+'</span><input id="shCopay" inputmode="decimal" value="10"></label>'+
  '<label><span>'+E.sh_limit+'</span><input id="shLimit" inputmode="decimal" value="5000"></label>'+
  '<div class="sh-actions"><button class="btn-main" id="shDl">'+I.dl+'<span>'+E.sh_dl+'</span></button>'+
  '<button class="btn-alt" id="shShare">'+I.share+'<span>'+E.sh_share+'</span></button>'+
  '<button class="btn-alt" id="shCopy"><span>'+E.sh_copy+'</span></button>'+
  '<select id="shFmt" data-tt="'+E.sh_fmt+'"><option value="png">PNG</option><option value="jpg">JPG</option></select></div>'+
  '<p class="sh-status" role="status"></p></div><canvas id="shPrev" aria-hidden="true"></canvas></div>';
est.appendChild(shp);

function shNum(id){return parseFloat(String(document.getElementById(id).value).replace(/[,\s\u20B9]/g,''));}
function shResult(){
  var room=shNum('shRoom'),days=shNum('shDays'),other=shNum('shOther'),cp=shNum('shCopay'),lim=shNum('shLimit');
  if(!(room>0)||!(days>0)||!(other>=0)||!(cp>=0)||cp>100||!(lim>0))return null;
  return calc(room,Math.round(days),other,cp,lim);
}
function refreshPreview(){
  var cv=document.getElementById('shPrev');if(!cv)return;
  var r=shResult();
  if(r)drawCard(cv,r);else{cv.width=1080;cv.height=1560;}
}
var limDirty=false,copDirty=false;
function syncPolicy(){
  if(!limDirty)document.getElementById('shLimit').value=S.limit;
  if(!copDirty)document.getElementById('shCopay').value=S.copay;
  refreshPreview();
}
function shNote(m){shp.querySelector('.sh-status').textContent=m;}
function shGo(fn){var r=shResult();if(!r){shNote(T(E.sh_bad));return;}fn(r,document.getElementById('shFmt').value,shNote);}
[].forEach.call(shp.querySelectorAll('input'),function(i){i.addEventListener('input',function(){
  if(i.id==='shLimit')limDirty=true;if(i.id==='shCopay')copDirty=true;
  shNote('');refreshPreview();});});
document.getElementById('shDl').onclick=function(){shGo(doDownload);};
document.getElementById('shShare').onclick=function(){shGo(doShare);};
document.getElementById('shCopy').onclick=function(){var r=shResult();if(!r){shNote(T(E.sh_bad));return;}doCopy(r,shNote);};
refreshPreview();

/* "Save as image" under every estimate in the chat */
var isEst=false;
function addActions(r){
  var d=el('div','cs-actions');
  var b1=el('button','',I.dl+'<span>'+E.ch_save+'</span>'),b2=el('button','',I.share+'<span>'+E.sh_share+'</span>');
  b1.onclick=function(){doDownload(r,'png',function(m){addMsg(m,'b');});};
  b2.onclick=function(){doShare(r,'png',function(m){addMsg(m,'b');});};
  d.appendChild(b1);d.appendChild(b2);msgs.appendChild(d);tn(d);msgs.scrollTop=msgs.scrollHeight;
}

var fab=el('button','',I.chat);fab.id='cs-fab';fab.setAttribute('data-tt',E.c_open);
var panel=el('div');panel.id='cs-panel';panel.setAttribute('role','dialog');
panel.innerHTML='<div id="cs-head"><span class="mk">'+mark()+'</span><div class="ht"><b>'+E.c_title+'</b><small>'+E.c_sub+'</small></div><button id="cs-x" data-tt="'+E.c_close+'">'+I.x+'</button></div>'+
  '<div id="cs-msgs" aria-live="polite"></div><div id="cs-chips"></div>'+
  '<div id="cs-in"><input id="cs-q" data-ph="'+E.c_ph+'" autocomplete="off"><button id="cs-send" data-tt="'+E.c_send+'">'+I.send+'</button></div>';
document.body.appendChild(fab);document.body.appendChild(panel);
var msgs=panel.querySelector('#cs-msgs'),q=panel.querySelector('#cs-q'),chips=panel.querySelector('#cs-chips');

function addMsg(text,who){
  var d=el('div','cs-m '+(who==='u'?'cs-u':'cs-b'));d.textContent=text;msgs.appendChild(d);
  if(who!=='u')tn(d);
  msgs.scrollTop=msgs.scrollHeight;return d;
}
var CHIPS=[
  ['chip1','Room rent 8000 per day for 3 days, other charges 1,20,000, copay 10%'],
  ['chip2','Compare rooms'],['chip3','Safe room rent'],['chip4','Documents checklist'],
  ['chip5','Cashless steps'],['chip6','Questions for hospital'],['chip7','Copy last estimate']
];
CHIPS.forEach(function(c){
  var b=el('button');b.textContent=E[c[0]];
  b.onclick=function(){send(c[1],T(E[c[0]]));};
  chips.appendChild(b);
});

function handle(t){
  isEst=false;
  var l=t.toLowerCase();
  var lim=pick(new RegExp('(?:limit|cap|सीमा|मर्यादा)[^\\d]{0,20}'+NUM,'i'),t);
  var cp=t.match(/(?:(?:co-?pay|को-?पे)[^\d]{0,10}(\d+(?:\.\d+)?))|(?:(\d+(?:\.\d+)?)\s*%\s*(?:co-?pay|को-?पे))/i);
  var cpv=cp?parseFloat(cp[1]||cp[2]):NaN;
  var room=pick(new RegExp('(?:room|कमरा|कमरे|खोली)[^\\d]{0,24}'+NUM,'i'),t);
  var other=pick(new RegExp('(?:other|अन्य|इतर|बाकी)[^\\d]{0,24}'+NUM,'i'),t);
  var dm=t.match(/(\d+)\s*(?:days?|nights?|दिन|दिवस|रात)/i);
  var days=dm?parseInt(dm[1],10):NaN;

  if(/^(set|change|update)\b/.test(l)&&(!isNaN(lim)||!isNaN(cpv))){
    var out=[];
    if(!isNaN(lim)){S.limit=lim;out.push(T(E.u_lim,rs(lim)));}
    if(!isNaN(cpv)){S.copay=cpv;out.push(T(E.u_cop,cpv));}
    return T(E.upd,out.join(', '));
  }
  if(!isNaN(room)&&!isNaN(other)){
    var c=isNaN(cpv)?S.copay:cpv,L=isNaN(lim)?S.limit:lim,d=isNaN(days)?1:days;
    var r=calc(room,d,other,c,L);S.last=r;isEst=true;
    var s=fmt(r);
    if(isNaN(days))s+='\n'+T(E.l_days1);
    if(r.ratio<1){var sv2=calc(L,d,other,c,L);s+='\n\n'+T(E.l_tip,rs(L),rs(sv2.patient),rs(r.patient-sv2.patient));}
    return s;
  }
  if(/copy|कॉपी/.test(l)){
    if(!S.last)return E.noest;
    try{navigator.clipboard.writeText(fmt(S.last));return E.copied;}catch(e){return fmt(S.last);}
  }
  if(/compare|all rooms|which room|room options|तुलना/.test(l)){
    if(!S.last)return E.needest;
    var s2=T(E.cmp_h,S.last.days,rs(S.last.other),S.last.copay)+'\n';
    [1500,3000,5000,8000,12000].forEach(function(rm){
      var x=calc(rm,S.last.days,S.last.other,S.last.copay,S.limit);
      s2+=T(E.cmp_r,rs(rm),rs(x.patient))+(x.ratio<1?'  '+T(E.cmp_d):'')+'\n';
    });
    return s2.trim();
  }
  if(/safe|ideal|best room|max room|maximum room|सुरक्षित/.test(l))
    return T(E.safe,rs(S.limit),rs(S.limit*1.6),(100/1.6).toFixed(1));
  if(/deduction|proportion|कटौती|कपात/.test(l))return E.why;
  if(/document|checklist|papers?\b|दस्तावेज|कागदपत्र/.test(l))return E.docs;
  if(/cashless|reimburse|claim process|steps|how to claim|कैशलेस|कॅशलेस|प्रक्रिया/.test(l))return E.cash;
  if(/ask.*hospital|questions|सवाल|प्रश्न/.test(l))return E.askh;
  if(/^(help|\?|what can you do|मदद|मदत)/.test(l))return E.help;
  return null;
}

function llm(t){
  var sys='You are ClaimSense Assistant, helping people in India understand health insurance claims, room rent limits, co-pay, sub-limits, proportional deduction, cashless and reimbursement claims. Be concise (under 120 words) and practical. Never invent policy numbers or guarantee claim approval; tell the user to check their policy document. Reply in '+LLMN[lang]+' unless the user writes in another language. Current assumptions: room rent limit '+S.limit+' per day, co-pay '+S.copay+'%.'+(S.last?' Last estimate: patient share '+Math.round(S.last.patient)+' on total '+Math.round(S.last.total)+'.':'')+' For exact numbers ask the user to type: room 8000 for 3 days, other 1,20,000, copay 10%.';
  var m=[{role:'system',content:sys}].concat(S.hist.slice(-8),[{role:'user',content:t}]);
  var ctl=new AbortController();var to=setTimeout(function(){ctl.abort();},90000);
  return fetch('http://localhost:11434/api/chat',{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({model:S.model,messages:m,stream:false})})
    .then(function(r){clearTimeout(to);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(function(j){var a=(j.message&&j.message.content)||'';S.hist.push({role:'user',content:t},{role:'assistant',content:a});return a||'...';});
}

function send(text,shown){
  text=(text||q.value).trim();if(!text)return;
  q.value='';addMsg(shown||text,'u');
  var a=handle(text);
  if(a!==null){addMsg(a,'b');if(isEst&&S.last)addActions(S.last);return;}
  var w=addMsg(E.think,'b');
  llm(text).then(function(x){w.textContent=x;msgs.scrollTop=msgs.scrollHeight;})
    .catch(function(e){w.textContent=T(E.err,e.message,S.model);msgs.scrollTop=msgs.scrollHeight;});
}
fab.onclick=function(){var o=panel.classList.toggle('open');fab.classList.toggle('open',o);if(o)q.focus();};
panel.querySelector('#cs-x').onclick=function(){panel.classList.remove('open');fab.classList.remove('open');};
panel.querySelector('#cs-send').onclick=function(){send();};
q.addEventListener('keydown',function(e){if(e.key==='Enter')send();});

/* ---------- language switching ---------- */
function setLang(l,quiet){
  lang=l;sel.value=l;document.documentElement.lang=l;
  try{localStorage.setItem('cs_lang',l);}catch(e){}
  tn(document.body);attrs();refreshPreview();
  if(!quiet)addMsg(T(E.langset,NAMES[l]),'b');
}
sel.addEventListener('change',function(){setLang(sel.value,false);});

var raf=0;
new MutationObserver(function(){
  if(raf)return;
  raf=requestAnimationFrame(function(){raf=0;tn(document.body);attrs();});
}).observe(document.body,{childList:true,subtree:true});

addMsg(E.greet,'b');
setLang(lang,true);
})();
