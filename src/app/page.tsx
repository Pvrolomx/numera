'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { 
  calculateProfile, 
  calculateBiorhythms, 
  calculatePythagorasMatrix,
  resonance,
  NumerologyProfile,
  BiorhythmData,
  PythagorasMatrix
} from '@/lib/numerology';
import { translations, Lang, Translations } from '@/lib/translations';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, ReferenceLine, Tooltip 
} from 'recharts';
import { User, Calendar, Sparkles, Users, Grid3X3, Activity, Globe } from 'lucide-react';

// Language Context
const LangContext = createContext<{ lang: Lang; t: Translations; setLang: (l: Lang) => void }>({
  lang: 'es',
  t: translations.es,
  setLang: () => {}
});

const useLang = () => useContext(LangContext);

interface UserData {
  name: string;
  birthDate: string;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'calendar' | 'compatibility'>('dashboard');
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [biorhythms, setBiorhythms] = useState<BiorhythmData | null>(null);
  const [matrix, setMatrix] = useState<PythagorasMatrix | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [lang, setLang] = useState<Lang>('es');
  
  const t = translations[lang];
  
  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('numera_user');
    if (saved) setUserData(JSON.parse(saved));
    const savedLang = localStorage.getItem('numera_lang') as Lang;
    if (savedLang) setLang(savedLang);
  }, []);
  
  // Save language preference
  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('numera_lang', newLang);
  };
  
  // Calculate everything when userData changes
  useEffect(() => {
    if (userData) {
      const birthDate = new Date(userData.birthDate);
      const today = new Date();
      
      setProfile(calculateProfile(userData.name, birthDate));
      setBiorhythms(calculateBiorhythms(birthDate, today));
      setMatrix(calculatePythagorasMatrix(birthDate));
      
      const data = [];
      for (let i = -15; i <= 15; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const bio = calculateBiorhythms(birthDate, date);
        data.push({
          day: i === 0 ? (lang === 'es' ? 'Hoy' : 'Today') : i > 0 ? `+${i}` : `${i}`,
          physical: Math.round(bio.physical * 100),
          emotional: Math.round(bio.emotional * 100),
          intellectual: Math.round(bio.intellectual * 100),
          isToday: i === 0
        });
      }
      setChartData(data);
    }
  }, [userData, lang]);
  
  // Onboarding
  if (!userData) {
    return (
      <LangContext.Provider value={{ lang, t, setLang: handleSetLang }}>
        <Onboarding onComplete={(data) => {
          localStorage.setItem('numera_user', JSON.stringify(data));
          setUserData(data);
        }} />
      </LangContext.Provider>
    );
  }
  
  return (
    <LangContext.Provider value={{ lang, t, setLang: handleSetLang }}>
      <main className="min-h-screen p-4 max-w-md mx-auto">
        {/* Header */}
        <header className="text-center mb-6 relative">
          <h1 className="text-3xl font-bold gradient-gold">{t.appName}</h1>
          <p className="text-gold/60 text-sm">{t.tagline}</p>
          
          {/* Language Toggle */}
          <button
            onClick={() => handleSetLang(lang === 'es' ? 'en' : 'es')}
            className="absolute right-0 top-0 flex items-center gap-1 text-xs text-white/50 hover:text-gold transition-colors bg-mystic-card px-2 py-1 rounded-full border border-gold/20"
          >
            <Globe size={14} />
            {lang.toUpperCase()}
          </button>
        </header>
        
        {/* Navigation */}
        <nav className="flex justify-around mb-6 card-mystic p-2">
          {[
            { id: 'dashboard', icon: Activity, label: t.navToday },
            { id: 'profile', icon: User, label: t.navProfile },
            { id: 'calendar', icon: Calendar, label: t.navMonth },
            { id: 'compatibility', icon: Users, label: t.navMatch },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                activeTab === id ? 'text-gold bg-gold/10' : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </nav>
        
        {/* Content */}
        {activeTab === 'dashboard' && profile && biorhythms && (
          <Dashboard 
            name={userData.name}
            profile={profile} 
            biorhythms={biorhythms} 
            chartData={chartData}
          />
        )}
        
        {activeTab === 'profile' && profile && matrix && (
          <Profile profile={profile} matrix={matrix} />
        )}
        
        {activeTab === 'calendar' && userData && (
          <CalendarView birthDate={new Date(userData.birthDate)} lifeNumber={profile?.lifeNumber || 1} />
        )}
        
        {activeTab === 'compatibility' && userData && (
          <Compatibility userData={userData} />
        )}
        
        {/* Reset button */}
        <button 
          onClick={() => {
            localStorage.removeItem('numera_user');
            setUserData(null);
          }}
          className="mt-8 text-white/30 text-xs w-full text-center hover:text-white/50"
        >
          {t.resetData}
        </button>
        
        {/* Footer */}
        <footer className="mt-6 text-center text-white/20 text-xs pb-4">
          {t.madeBy} <a href="https://duendes.app" className="text-gold/40 hover:text-gold/60">duendes.app</a> 2026
        </footer>
      </main>
    </LangContext.Provider>
  );
}

// ============================================
// ONBOARDING COMPONENT
// ============================================
function Onboarding({ onComplete }: { onComplete: (data: UserData) => void }) {
  const { t, lang, setLang } = useLang();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Language Toggle */}
      <button
        onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
        className="absolute right-4 top-4 flex items-center gap-1 text-xs text-white/50 hover:text-gold transition-colors bg-mystic-card px-2 py-1 rounded-full border border-gold/20"
      >
        <Globe size={14} />
        {lang.toUpperCase()}
      </button>
      
      <div className="text-center mb-8">
        <Sparkles className="text-gold mx-auto mb-4" size={48} />
        <h1 className="text-4xl font-bold gradient-gold mb-2">{t.appName}</h1>
        <p className="text-white/60">{t.onboardingTitle}</p>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-gold/80 text-sm mb-2">{t.nameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-mystic-card border border-gold/20 rounded-lg p-3 text-white focus:border-gold focus:outline-none"
            placeholder={t.namePlaceholder}
          />
        </div>
        
        <div>
          <label className="block text-gold/80 text-sm mb-2">{t.birthLabel}</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-mystic-card border border-gold/20 rounded-lg p-3 text-white focus:border-gold focus:outline-none"
          />
        </div>
        
        <button
          onClick={() => name && birthDate && onComplete({ name, birthDate })}
          disabled={!name || !birthDate}
          className="w-full bg-gold text-mystic-bg font-semibold py-3 rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
        >
          {t.calculateBtn}
        </button>
      </div>
    </main>
  );
}

// ============================================
// DASHBOARD COMPONENT
// ============================================
function Dashboard({ 
  name, profile, biorhythms, chartData 
}: { 
  name: string;
  profile: NumerologyProfile;
  biorhythms: BiorhythmData;
  chartData: any[];
}) {
  const { t } = useLang();
  const meaning = t.meanings[profile.lifeNumber as keyof typeof t.meanings];
  
  return (
    <div className="space-y-4">
      {/* Today's Summary */}
      <div className="card-mystic p-4">
        <h2 className="text-gold font-semibold mb-1">{t.todayGreeting} {name.split(' ')[0]}</h2>
        <p className="text-white/60 text-sm mb-3">
          {t.lifeNumberIs} <span className="text-gold font-bold">{profile.lifeNumber}</span> - {meaning?.title}
        </p>
        
        {biorhythms.powerDay && (
          <div className="bg-gold/20 border border-gold/40 rounded-lg p-3 mb-3">
            <p className="text-gold text-sm font-semibold">{t.powerDay}</p>
            <p className="text-white/70 text-xs">{t.powerDayDesc}</p>
          </div>
        )}
        
        {(biorhythms.isCritical.physical || biorhythms.isCritical.emotional || biorhythms.isCritical.intellectual) && (
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 mb-3">
            <p className="text-red-400 text-sm font-semibold">{t.criticalDay}</p>
            <p className="text-white/70 text-xs">
              {biorhythms.isCritical.physical && `${t.physical} `} 
              {biorhythms.isCritical.emotional && `${t.emotional} `} 
              {biorhythms.isCritical.intellectual && t.intellectual}
            </p>
          </div>
        )}
      </div>
      
      {/* Biorhythm Meters */}
      <div className="card-mystic p-4">
        <h3 className="text-white/80 text-sm mb-3">{t.biorhythmsToday}</h3>
        
        {[
          { label: t.physical, value: biorhythms.physical, color: '#EF4444' },
          { label: t.emotional, value: biorhythms.emotional, color: '#3B82F6' },
          { label: t.intellectual, value: biorhythms.intellectual, color: '#22C55E' },
        ].map(({ label, value, color }) => (
          <div key={label} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/70">{label}</span>
              <span style={{ color }}>{Math.round(value * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${Math.abs(value) * 50 + 50}%`,
                  backgroundColor: color,
                  opacity: value >= 0 ? 1 : 0.4
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Chart */}
      <div className="card-mystic p-4">
        <h3 className="text-white/80 text-sm mb-3">{t.next15days}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="day" tick={{ fill: '#ffffff50', fontSize: 10 }} />
            <YAxis domain={[-100, 100]} tick={{ fill: '#ffffff50', fontSize: 10 }} />
            <ReferenceLine y={0} stroke="#ffffff30" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#12122a', border: '1px solid #D4AF37' }}
              labelStyle={{ color: '#D4AF37' }}
            />
            <Line type="monotone" dataKey="physical" stroke="#EF4444" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="emotional" stroke="#3B82F6" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="intellectual" stroke="#22C55E" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <span className="text-red-500">● {t.physical}</span>
          <span className="text-blue-500">● {t.emotional}</span>
          <span className="text-green-500">● {t.intellectual}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PROFILE COMPONENT
// ============================================
function Profile({ profile, matrix }: { profile: NumerologyProfile; matrix: PythagorasMatrix }) {
  const { t } = useLang();
  
  const numbers = [
    { label: t.lifeNumber, value: profile.lifeNumber, desc: t.lifeMission },
    { label: t.expression, value: profile.expressionNumber, desc: t.howYouManifest },
    { label: t.soul, value: profile.soulNumber, desc: t.innerDesire },
    { label: t.personality, value: profile.personalityNumber, desc: t.howOthersSee },
  ];
  
  const meaning = t.meanings[profile.lifeNumber as keyof typeof t.meanings];
  
  // Translate matrix strengths/weaknesses
  const translateMatrixItems = (items: string[]) => {
    const matrixMap: Record<string, number> = {
      'Carácter/Voluntad': 1, 'Character/Will': 1,
      'Energía/Magnetismo': 2, 'Energy/Magnetism': 2,
      'Creatividad/Interés': 3, 'Creativity/Interest': 3,
      'Salud/Estabilidad': 4, 'Health/Stability': 4,
      'Intuición/Lógica': 5, 'Intuition/Logic': 5,
      'Trabajo/Compromiso': 6, 'Work/Commitment': 6,
      'Suerte/Talento': 7, 'Luck/Talent': 7,
      'Responsabilidad/Deber': 8, 'Responsibility/Duty': 8,
      'Memoria/Inteligencia': 9, 'Memory/Intelligence': 9
    };
    return items.map(item => {
      const num = matrixMap[item];
      return num ? t.matrixMeanings[num as keyof typeof t.matrixMeanings] : item;
    });
  };
  
  return (
    <div className="space-y-4">
      {/* 4 Numbers */}
      <div className="grid grid-cols-2 gap-3">
        {numbers.map(({ label, value, desc }) => {
          const numMeaning = t.meanings[value as keyof typeof t.meanings];
          return (
            <div key={label} className="card-mystic p-3">
              <div className="text-3xl font-bold text-gold mb-1">{value}</div>
              <div className="text-white text-sm font-medium">{label}</div>
              <div className="text-white/50 text-xs">{numMeaning?.title}</div>
            </div>
          );
        })}
      </div>
      
      {/* Number Meaning */}
      <div className="card-mystic p-4">
        <h3 className="text-gold font-semibold mb-2">{t.yourLifeNumber} {profile.lifeNumber}</h3>
        <p className="text-white/70 text-sm">{meaning?.description}</p>
      </div>
      
      {/* Pythagoras Matrix */}
      <div className="card-mystic p-4">
        <h3 className="text-white/80 text-sm mb-3 flex items-center gap-2">
          <Grid3X3 size={16} /> {t.pythagorasMatrix}
        </h3>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1,4,7,2,5,8,3,6,9].map((num, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const freq = matrix.matrix[row][col];
            return (
              <div 
                key={num}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center ${
                  freq > 0 ? 'bg-gold/20 border border-gold/40' : 'bg-white/5 border border-white/10'
                }`}
              >
                <span className="text-gold font-bold">{num}</span>
                <span className="text-xs text-white/50">{'●'.repeat(freq) || '○'}</span>
              </div>
            );
          })}
        </div>
        
        {matrix.strengths.length > 0 && (
          <div className="mb-2">
            <span className="text-green-400 text-xs">{t.strengths} </span>
            <span className="text-white/70 text-xs">{translateMatrixItems(matrix.strengths).join(', ')}</span>
          </div>
        )}
        
        {matrix.weaknesses.length > 0 && (
          <div>
            <span className="text-yellow-400 text-xs">{t.toDevelop} </span>
            <span className="text-white/70 text-xs">{translateMatrixItems(matrix.weaknesses).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// CALENDAR COMPONENT
// ============================================
function CalendarView({ birthDate, lifeNumber }: { birthDate: Date; lifeNumber: number }) {
  const { t } = useLang();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  
  const days = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    const bio = calculateBiorhythms(birthDate, date);
    const dayRes = resonance(i, lifeNumber);
    
    let status: 'power' | 'good' | 'neutral' | 'critical' | 'isopsefia' = 'neutral';
    
    if (dayRes === 100) status = 'isopsefia';
    else if (bio.powerDay) status = 'power';
    else if (bio.isCritical.physical || bio.isCritical.emotional || bio.isCritical.intellectual) status = 'critical';
    else if (bio.physical > 0.5 || bio.emotional > 0.5) status = 'good';
    
    days.push({ day: i, status, isToday: i === today.getDate() });
  }
  
  return (
    <div className="card-mystic p-4">
      <h3 className="text-gold font-semibold text-center mb-4">{t.months[month]} {year}</h3>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {t.days.map((d, i) => (
          <div key={i} className="text-white/50">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
              !d ? '' :
              d.isToday ? 'ring-2 ring-gold' : ''
            } ${
              !d ? '' :
              d.status === 'isopsefia' ? 'bg-purple-500/40 text-purple-200' :
              d.status === 'power' ? 'bg-green-500/40 text-green-200' :
              d.status === 'good' ? 'bg-green-500/20 text-green-300' :
              d.status === 'critical' ? 'bg-red-500/30 text-red-300' :
              'bg-white/5 text-white/50'
            }`}
          >
            {d?.day}
          </div>
        ))}
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
        <span className="text-green-400">{t.dayPower}</span>
        <span className="text-green-300">{t.dayFavorable}</span>
        <span className="text-red-400">{t.dayCritical}</span>
        <span className="text-purple-300">{t.dayResonance}</span>
      </div>
    </div>
  );
}

// ============================================
// COMPATIBILITY COMPONENT  
// ============================================
function Compatibility({ userData }: { userData: UserData }) {
  const { t } = useLang();
  const [otherName, setOtherName] = useState('');
  const [otherBirth, setOtherBirth] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const calculate = () => {
    if (!otherName || !otherBirth) return;
    
    const myProfile = calculateProfile(userData.name, new Date(userData.birthDate));
    const theirProfile = calculateProfile(otherName, new Date(otherBirth));
    
    const lifeRes = resonance(myProfile.lifeNumber, theirProfile.lifeNumber);
    const expressionRes = resonance(myProfile.expressionNumber, theirProfile.expressionNumber);
    const soulRes = resonance(myProfile.soulNumber, theirProfile.soulNumber);
    
    const overall = Math.round((lifeRes + expressionRes + soulRes) / 3);
    
    setResult({
      theirProfile,
      lifeRes,
      expressionRes,
      soulRes,
      overall
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="card-mystic p-4">
        <h3 className="text-gold font-semibold mb-3">{t.numericCompatibility}</h3>
        
        <div className="space-y-3">
          <input
            type="text"
            value={otherName}
            onChange={(e) => setOtherName(e.target.value)}
            placeholder={t.otherPersonName}
            className="w-full bg-mystic-bg border border-gold/20 rounded-lg p-3 text-white focus:border-gold focus:outline-none"
          />
          <input
            type="date"
            value={otherBirth}
            onChange={(e) => setOtherBirth(e.target.value)}
            className="w-full bg-mystic-bg border border-gold/20 rounded-lg p-3 text-white focus:border-gold focus:outline-none"
          />
          <button
            onClick={calculate}
            disabled={!otherName || !otherBirth}
            className="w-full bg-gold text-mystic-bg font-semibold py-3 rounded-lg disabled:opacity-50"
          >
            {t.calculateCompatibility}
          </button>
        </div>
      </div>
      
      {result && (
        <div className="card-mystic p-4">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold gradient-gold">{result.overall}%</div>
            <div className="text-white/60 text-sm">{t.overallCompatibility}</div>
          </div>
          
          <div className="space-y-2">
            {[
              { label: t.lifeMissionCompat, value: result.lifeRes },
              { label: t.expressionCompat, value: result.expressionRes },
              { label: t.soulConnection, value: result.soulRes },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-white/70 text-sm">{label}</span>
                <span className={`font-semibold ${
                  value >= 80 ? 'text-green-400' : 
                  value >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>{value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
