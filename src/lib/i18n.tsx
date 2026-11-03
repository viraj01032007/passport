import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'mr' | 'hi'
export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'mr', label: 'मराठी' },
  { id: 'hi', label: 'हिंदी' },
]

const en = {
  'top.emergency': 'Emergency',
  'top.women': 'Women helpline',
  'top.cyber': 'Cybercrime',
  'top.assist': 'Citizen assistance',
  'top.proposal': 'Proposed system · Not an official website',
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.services': 'Citizen Services',
  'nav.process': 'Verification Process',
  'nav.stations': 'Location',
  'nav.contact': 'Contact',
  'nav.track': 'Track Application',
  'nav.login': 'Login',
  'nav.book': 'Book Appointment',
  'hero.eyebrow': 'PoliceFlow · Proposed for Navi Mumbai Police',
  'hero.s1': 'Safer city.',
  'hero.s2': 'Smarter services.',
  'hero.s3': 'Faster verification.',
  'hero.sub': 'Making police verification simpler through organised appointments, digital preparation and transparent citizen services.',
  'hero.book': 'Book Appointment',
  'hero.track': 'Track Application',
  'hero.explore': 'Explore Services',
  'card.title': 'Your appointment at a glance',
  'card.booking': 'Appointment booking',
  'card.readiness': 'Document readiness',
  'card.pass': 'Digital verification pass',
  'card.queue': 'Live queue status',
  'card.confirmed': 'Confirmed',
  'card.ready': 'Issued',
  'card.low': 'Low',
  'svc.eyebrow': 'Quick citizen services',
  'svc.title': 'What do you need today?',
  'svc.sub': 'PoliceFlow services open inside this site. Official government services open their own websites in a new tab.',
  'svc.pf': 'PoliceFlow',
  'svc.official': 'Official site',
  'jr.eyebrow': 'Verification process',
  'jr.title': 'Your verification journey, simplified.',
  'help.title': 'Emergency helplines',
  'help.sub': 'Toll-free and available 24×7. Save these numbers.',
  'st.eyebrow': 'Where to go',
  'st.title': 'Find a police station',
  'st.search': 'Search by area or station name',
  'news.eyebrow': 'News & public awareness',
  'news.title': 'Latest updates',
  'exp.eyebrow': 'Explain my verification',
  'exp.title': 'Why is police verification required?',
  'asst.title': 'Verification assistant',
  'asst.hint': 'Pick a question. Answers are general information only.',
  'cta.title': 'Ready when you are.',
  'cta.sub': 'Pick a slot in under two minutes and arrive with everything you need.',
}
type Key = keyof typeof en

const mr: Record<Key, string> = {
  'top.emergency': 'आपत्कालीन',
  'top.women': 'महिला हेल्पलाइन',
  'top.cyber': 'सायबर गुन्हे',
  'top.assist': 'नागरिक सहाय्य',
  'top.proposal': 'प्रस्तावित प्रणाली · अधिकृत संकेतस्थळ नाही',
  'nav.home': 'मुख्यपृष्ठ',
  'nav.about': 'आमच्याविषयी',
  'nav.services': 'नागरिक सेवा',
  'nav.process': 'पडताळणी प्रक्रिया',
  'nav.stations': 'ठिकाण',
  'nav.contact': 'संपर्क',
  'nav.track': 'अर्जाची स्थिती',
  'nav.login': 'लॉगिन',
  'nav.book': 'भेटीची वेळ घ्या',
  'hero.eyebrow': 'PoliceFlow · नवी मुंबई पोलिसांसाठी प्रस्तावित',
  'hero.s1': 'सुरक्षित शहर.',
  'hero.s2': 'स्मार्ट सेवा.',
  'hero.s3': 'जलद पडताळणी.',
  'hero.sub': 'नियोजित भेटी, डिजिटल तयारी आणि पारदर्शक नागरिक सेवांद्वारे पोलीस पडताळणी सोपी करणे.',
  'hero.book': 'भेटीची वेळ घ्या',
  'hero.track': 'अर्जाची स्थिती पहा',
  'hero.explore': 'सेवा पहा',
  'card.title': 'तुमची भेट एका नजरेत',
  'card.booking': 'भेट नोंदणी',
  'card.readiness': 'कागदपत्रांची तयारी',
  'card.pass': 'डिजिटल पडताळणी पास',
  'card.queue': 'रांगेची स्थिती',
  'card.confirmed': 'निश्चित',
  'card.ready': 'जारी',
  'card.low': 'कमी',
  'svc.eyebrow': 'जलद नागरिक सेवा',
  'svc.title': 'आज तुम्हाला काय हवे आहे?',
  'svc.sub': 'PoliceFlow सेवा याच संकेतस्थळावर उघडतात. अधिकृत शासकीय सेवा नवीन टॅबमध्ये त्यांच्या संकेतस्थळावर उघडतात.',
  'svc.pf': 'PoliceFlow',
  'svc.official': 'अधिकृत संकेतस्थळ',
  'jr.eyebrow': 'पडताळणी प्रक्रिया',
  'jr.title': 'तुमचा पडताळणी प्रवास, सोपा.',
  'help.title': 'आपत्कालीन हेल्पलाइन',
  'help.sub': 'टोल-फ्री आणि २४×७ उपलब्ध. हे क्रमांक जतन करा.',
  'st.eyebrow': 'कुठे यायचे',
  'st.title': 'पोलीस ठाणे शोधा',
  'st.search': 'परिसर किंवा ठाण्याचे नाव शोधा',
  'news.eyebrow': 'बातम्या व जनजागृती',
  'news.title': 'ताज्या घडामोडी',
  'exp.eyebrow': 'माझी पडताळणी समजून घ्या',
  'exp.title': 'पोलीस पडताळणी का आवश्यक आहे?',
  'asst.title': 'पडताळणी सहाय्यक',
  'asst.hint': 'प्रश्न निवडा. उत्तरे केवळ सर्वसाधारण माहितीसाठी आहेत.',
  'cta.title': 'तुम्ही तयार असाल तेव्हा.',
  'cta.sub': 'दोन मिनिटांत वेळ निवडा आणि आवश्यक सर्व कागदपत्रांसह या.',
}

const hi: Record<Key, string> = {
  'top.emergency': 'आपातकालीन',
  'top.women': 'महिला हेल्पलाइन',
  'top.cyber': 'साइबर अपराध',
  'top.assist': 'नागरिक सहायता',
  'top.proposal': 'प्रस्तावित प्रणाली · आधिकारिक वेबसाइट नहीं',
  'nav.home': 'होम',
  'nav.about': 'हमारे बारे में',
  'nav.services': 'नागरिक सेवाएँ',
  'nav.process': 'सत्यापन प्रक्रिया',
  'nav.stations': 'स्थान',
  'nav.contact': 'संपर्क',
  'nav.track': 'आवेदन की स्थिति',
  'nav.login': 'लॉगिन',
  'nav.book': 'अपॉइंटमेंट बुक करें',
  'hero.eyebrow': 'PoliceFlow · नवी मुंबई पुलिस के लिए प्रस्तावित',
  'hero.s1': 'सुरक्षित शहर.',
  'hero.s2': 'स्मार्ट सेवाएँ.',
  'hero.s3': 'तेज़ सत्यापन.',
  'hero.sub': 'व्यवस्थित अपॉइंटमेंट, डिजिटल तैयारी और पारदर्शी नागरिक सेवाओं के ज़रिए पुलिस सत्यापन को आसान बनाना.',
  'hero.book': 'अपॉइंटमेंट बुक करें',
  'hero.track': 'आवेदन ट्रैक करें',
  'hero.explore': 'सेवाएँ देखें',
  'card.title': 'आपकी अपॉइंटमेंट एक नज़र में',
  'card.booking': 'अपॉइंटमेंट बुकिंग',
  'card.readiness': 'दस्तावेज़ तैयारी',
  'card.pass': 'डिजिटल सत्यापन पास',
  'card.queue': 'कतार की स्थिति',
  'card.confirmed': 'पुष्ट',
  'card.ready': 'जारी',
  'card.low': 'कम',
  'svc.eyebrow': 'त्वरित नागरिक सेवाएँ',
  'svc.title': 'आज आपको क्या चाहिए?',
  'svc.sub': 'PoliceFlow सेवाएँ इसी साइट पर खुलती हैं. आधिकारिक सरकारी सेवाएँ नए टैब में अपनी वेबसाइट पर खुलती हैं.',
  'svc.pf': 'PoliceFlow',
  'svc.official': 'आधिकारिक साइट',
  'jr.eyebrow': 'सत्यापन प्रक्रिया',
  'jr.title': 'आपकी सत्यापन यात्रा, आसान.',
  'help.title': 'आपातकालीन हेल्पलाइन',
  'help.sub': 'टोल-फ्री और 24×7 उपलब्ध. ये नंबर सेव करें.',
  'st.eyebrow': 'कहाँ आना है',
  'st.title': 'पुलिस थाना खोजें',
  'st.search': 'क्षेत्र या थाने का नाम खोजें',
  'news.eyebrow': 'समाचार और जन-जागरूकता',
  'news.title': 'ताज़ा अपडेट',
  'exp.eyebrow': 'मेरा सत्यापन समझें',
  'exp.title': 'पुलिस सत्यापन क्यों ज़रूरी है?',
  'asst.title': 'सत्यापन सहायक',
  'asst.hint': 'एक प्रश्न चुनें. उत्तर केवल सामान्य जानकारी हैं.',
  'cta.title': 'जब आप तैयार हों.',
  'cta.sub': 'दो मिनट में स्लॉट चुनें और सभी ज़रूरी दस्तावेज़ों के साथ आएँ.',
}

const DICT: Record<Lang, Record<Key, string>> = { en, mr, hi }
const KEY = 'policeflow.lang'

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const v = localStorage.getItem(KEY) as Lang | null
      return v && v in DICT ? v : 'en'
    } catch {
      return 'en'
    }
  })
  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'mr' ? 'mr' : 'hi'
    try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
  }, [lang])
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLang() {
  return useContext(Ctx)
}

export function useT() {
  const { lang } = useContext(Ctx)
  return (k: Key) => DICT[lang][k] ?? en[k]
}

/** Pick a value per language for content that lives outside the dictionary. */
export function pick<T>(lang: Lang, v: { en: T; mr?: T; hi?: T }): T {
  return v[lang] ?? v.en
}
