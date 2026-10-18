import { LanguageCode, VoiceTone } from '../types';

export interface ScriptTemplate {
  id: string;
  category: string;
  categoryHi: string;
  categoryMr: string;
  title: string;
  titleHi: string;
  titleMr: string;
  scriptHi: string;
  scriptMr: string;
  scriptEn: string;
  whatsappHi: string;
  whatsappMr: string;
  whatsappEn: string;
  smsHi: string;
  smsMr: string;
  smsEn: string;
}

export const POSITIVE_SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 'health_care',
    category: 'Health & Well-being',
    categoryHi: 'स्वास्थ्य व देखभाल',
    categoryMr: 'आरोग्य व काळजी',
    title: 'Medicine & Health Gentle Reminder',
    titleHi: 'दवाई व सेहत का स्नेहपूर्ण रिमाइंडर',
    titleMr: 'औषध व आरोग्याची प्रेमळ आठवण',
    scriptHi: 'नमस्ते {name} जी! आशा है आप बहुत अच्छे स्वास्थ्य और प्रसन्नता में होंगे। यह आपके प्रियजन {sender} की ओर से एक स्नेहपूर्ण और आदरणीय रिमाइंडर है कि कृपया अपनी सेहत का ध्यान रखें और निर्धारित समय पर अपनी दवाइयां लेना न भूलें। आपका दिन सुखमय और ऊर्जावान रहे!',
    scriptMr: 'नमस्कार {name} जी! आशा आहे आपण उत्तम आरोग्यात व आनंदात असाल. {sender} यांच्या वतीने मी आपल्या आरोग्याची काळजी घेण्यासाठी हा आदरयुक्त फोन केला आहे. कृपया वेळेवर आपले औषध घ्यावे आणि भरपूर विश्रांती घ्यावी. आपला दिवस अतिशय सुखकर जावो!',
    scriptEn: 'Hello {name}, warm and heartfelt greetings from {sender}! This is a gentle, caring reminder to please take your scheduled medicines and stay hydrated today. Wishing you wonderful health and a peaceful day ahead!',
    whatsappHi: 'नमस्ते {name} जी! 🌸 {sender} की ओर से स्नेहपूर्ण संदेश: कृपया अपनी सेहत का ख्याल रखें और समय पर दवाइयां अवश्य लें। आपका दिन शुभ और सुखमय हो!',
    whatsappMr: 'नमस्कार {name} जी! 🌿 {sender} यांच्या वतीने प्रेमळ आठवण: कृपया वेळच्या वेळी औषध घ्या आणि भरपूर पाणी प्या. आपले आरोग्य सदैव उत्तम राहो हीच सदिच्छा!',
    whatsappEn: 'Hello {name}! 🌿 Caring reminder from {sender}: Please take your scheduled medicine and take good care of your health today. Have a bright day!',
    smsHi: 'AwaazAI: Namaste {name} ji, gentle reminder from {sender} to take your timely medicines. Stay healthy and happy!',
    smsMr: 'AwaazAI: Namaskar {name} ji, {sender} kadoon aushadhachi aathvan. Kalji ghya aani nirogi raha!',
    smsEn: 'AwaazAI: Hello {name}, caring reminder from {sender} to take your medicines on time. Have a blessed day!',
  },
  {
    id: 'meeting_invite',
    category: 'Work & Collaboration',
    categoryHi: 'कामकाज व मीटिंग',
    categoryMr: 'कामकाज व बैठक',
    title: 'Important Meeting & Discussion Notice',
    titleHi: 'महत्वपूर्ण मीटिंग व कार्य चर्चा',
    titleMr: 'महत्त्वाची बैठक व चर्चा',
    scriptHi: 'नमस्ते {name} जी, आपका दिन शुभ हो! {sender} की तरफ से यह एक पूर्व सूचना है कि हमारी महत्वपूर्ण चर्चा आज निर्धारित समय पर होने जा रही है। आपके अमूल्य विचार और उपस्थिति हमारे लिए अत्यंत महत्वपूर्ण हैं।',
    scriptMr: 'नमस्कार {name} जी, आपला दिवस आनंददायी जावो! {sender} यांच्या वतीने आजच्या महत्त्वाच्या बैठकीची ही पूर्वकल्पना आहे. आपले विचार आणि मार्गदर्शन आमच्यासाठी नेहमीच मोलाचे आहे. आपण वेळेवर सहभागी व्हाल ही नम्र विनंती.',
    scriptEn: 'Hello {name}, greetings of the day! On behalf of {sender}, this is a polite reminder regarding our upcoming collaborative meeting. We deeply value your insights and look forward to our productive conversation.',
    whatsappHi: 'नमस्ते {name} जी! 🤝 {sender} की ओर से बैठक रिमाइंडर: हमारी चर्चा निर्धारित समय पर होगी। आपसे बातचीत के लिए उत्सुक हैं।',
    whatsappMr: 'नमस्कार {name} जी! 🤝 {sender} यांच्या वतीने बैठकीची नम्र आठवण: आपली नियोजित बैठक ठरलेल्या वेळेवर होईल. आपल्या उपस्थितीची वाट पाहत आहोत.',
    whatsappEn: 'Hello {name}! 🤝 Meeting reminder from {sender}: Looking forward to connecting at our scheduled time today.',
    smsHi: 'AwaazAI: Namaste {name} ji, meeting reminder from {sender}. Looking forward to connecting with you today.',
    smsMr: 'AwaazAI: Namaskar {name} ji, {sender} kadoon meeting chi aathvan. Bhetuya nirdharit velevar.',
    smsEn: 'AwaazAI: Hello {name}, friendly meeting reminder from {sender}. Looking forward to speaking soon.',
  },
  {
    id: 'festival_wishes',
    category: 'Festivals & Family',
    categoryHi: 'त्योहार व शुभकामनाएं',
    categoryMr: 'सण व कौटुंबिक शुभेच्छा',
    title: 'Heartwarming Festival & Family Greetings',
    titleHi: 'पावन पर्व व परिवार की शुभकामनाएं',
    titleMr: 'पावन सण व मनःपूर्वक सदिच्छा',
    scriptHi: 'नमस्ते {name} जी! पावन पर्व के इस पावन अवसर पर {sender} और पूरे परिवार की ओर से आपको और आपके परिजनों को ढेरों मंगलकामनाएं! ईश्वर आपके जीवन को सुख, समृद्धि और अपार आनंद से भर दें!',
    scriptMr: 'नमस्कार {name} जी! या पवित्र सणानिमित्त {sender} व संपूर्ण परिवाराकडून आपल्याला व आपल्या कुटुंबाला मनःपूर्वक हार्दिक शुभेच्छा! हे नवीन वर्ष आणि सण आपल्या जीवनात उत्तम आरोग्य व भरभराट घेऊन येवो!',
    scriptEn: 'Hello {name}, warm festive greetings! {sender} and family send you their deepest wishes filled with joy, peace, prosperity, and good fortune on this auspicious day!',
    whatsappHi: 'हार्दिक शुभकामनाएं {name} जी! ✨ {sender} और परिवार की ओर से इस पावन पर्व पर सुख, शांति और समृद्धि की ढेरों मंगलकामनाएं!',
    whatsappMr: 'मनःपूर्वक सदिच्छा {name} जी! ✨ {sender} आणि परिवाराकडून सणाच्या हार्दिक शुभेच्छा! आपले जीवन सुख-समृद्धीने बहरून जावो!',
    whatsappEn: 'Warmest Festive Wishes {name}! ✨ {sender} and family wish you unbounded joy, light, and happiness on this celebration!',
    smsHi: 'AwaazAI: Namaste {name} ji, heartiest festive wishes from {sender} and family. Stay blessed!',
    smsMr: 'AwaazAI: Namaskar {name} ji, sanachya khup khup shubhechha from {sender} & parivar!',
    smsEn: 'AwaazAI: Happy celebrations {name}! Warm wishes from {sender} and family.',
  },
  {
    id: 'gentle_payment',
    category: 'Accounts & Payments',
    categoryHi: 'लेखा व सौम्य भुगतान स्मरण',
    categoryMr: 'हिशोब व सौम्य पेमेंट आठवण',
    title: 'Polite & Respectful Payment Courtesy',
    titleHi: 'सौम्य और आदरपूर्ण भुगतान रिमाइंडर',
    titleMr: 'आदरयुक्त व नम्र देयक आठवण',
    scriptHi: 'नमस्ते {name} जी, आशा है आप सकुशल हैं। {sender} की ओर से यह एक बहुत ही विनम्र और आदरपूर्ण रिमाइंडर है कि पूर्व में साझा किया गया खाता विवरण देय है। यदि आपने भुगतान कर दिया हो तो कृपया इस संदेश को अनदेखा करें। आपके निरंतर सहयोग के लिए बहुत-बहुत धन्यवाद!',
    scriptMr: 'नमस्कार {name} जी! {sender} यांच्या वतीने ही अतिशय नम्र आणि आदरयुक्त आठवण आहे की पूर्वी पाठवलेले बिल क्लिअरन्स प्रलंबित आहे. आपण आधीच पाठवले असल्यास कृपया याकडे दुर्लक्ष करावे. आपल्या सहकार्याबद्दल मनापासून आभार!',
    scriptEn: 'Hello {name}, greetings. This is a very polite and courteous note from {sender} regarding the pending invoice. If already settled, kindly disregard this note. We genuinely appreciate your trust and cooperation!',
    whatsappHi: 'नमस्ते {name} जी 🙏 {sender} की ओर से विनम्र सूचना: पिछले बिल का भुगतान देय है। कृपया सुविधा अनुसार चेक कर लें। धन्यवाद!',
    whatsappMr: 'नमस्कार {name} जी 🙏 {sender} यांच्या वतीने नम्र आठवण: मागील बिलाचे पेमेंट प्रलंबित आहे. कृपया सोयीनुसार तपासावे. धन्यवाद!',
    whatsappEn: 'Hello {name} 🙏 Courtesy note from {sender}: Kindly review the pending invoice at your convenience. Thank you!',
    smsHi: 'AwaazAI: Namaste {name} ji, polite reminder from {sender} regarding invoice settlement. Thank you for your support.',
    smsMr: 'AwaazAI: Namaskar {name} ji, {sender} kadoon bill payment chi namra aathvan. Aabhar!',
    smsEn: 'AwaazAI: Hello {name}, courteous reminder from {sender} regarding invoice review. Thank you!',
  },
];

/**
 * Generate a thoughtful, positive script from user's brief goal
 */
export function generatePositiveScript(
  goal: string,
  contactName: string,
  senderName: string,
  lang: LanguageCode,
  tone: VoiceTone
): { script: string; whatsapp: string; sms: string } {
  const cName = contactName.trim() || (lang === 'mr' ? 'मित्रहो' : lang === 'hi' ? 'साथी' : 'Friend');
  const sName = senderName.trim() || 'Prem Jadhav';

  if (lang === 'mr') {
    return {
      script: `नमस्कार ${cName} जी! ${sName} यांच्या वतीने मी आपला सकारात्मक AI कॉल असिस्टंट बोलत आहे. ${goal} बद्दल ही एक प्रेमळ व महत्त्वाची आठवण आहे. आपल्या सर्व कामांना उत्तम यश लाभो आणि आपला दिवस अतिशय प्रसन्न जावो!`,
      whatsapp: `नमस्कार ${cName} जी! 🚩 ${sName} यांच्या वतीने ही एक नम्र व महत्त्वाची आठवण आहे: "${goal}". कृपया आपल्या सोयीनुसार लक्ष द्यावे. आपला दिवस आनंददायी जावो!`,
      sms: `AwaazAI: Namaskar ${cName} ji, ${sName} kadoon aathvan: ${goal}. Kalji ghya!`,
    };
  }

  if (lang === 'hi') {
    return {
      script: `नमस्ते ${cName} जी! आशा है आप बहुत अच्छे स्वास्थ्य में होंगे। ${sName} की तरफ से मैं आपका AI सहायक बात कर रहा हूँ। ${goal} के संदर्भ में यह एक आदरणीय और सकारात्मक रिमाइंडर है। आपका दिन बहुत ही मंगलमय और सफल रहे!`,
      whatsapp: `नमस्ते ${cName} जी! 🌸 ${sName} की ओर से यह एक स्नेहपूर्ण संदेश है: "${goal}". आशा है यह आपके लिए उपयोगी रहेगा। आपका दिन शुभ हो!`,
      sms: `AwaazAI: Namaste ${cName} ji, reminder from ${sName}: ${goal}. Have a great day!`,
    };
  }

  return {
    script: `Hello ${cName}! Warm greetings on behalf of ${sName}. I am calling with a positive reminder regarding: ${goal}. We truly wish you a wonderful and highly productive day ahead!`,
    whatsapp: `Hello ${cName}! 🌟 Polite note from ${sName}: "${goal}". Wishing you continued success and a great day!`,
    sms: `AwaazAI: Hello ${cName}, positive reminder from ${sName}: ${goal}. Best regards!`,
  };
}
