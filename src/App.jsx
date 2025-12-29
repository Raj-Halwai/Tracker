import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  BarChart2, 
  Grid, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Smartphone, 
  Activity, 
  Target, 
  Trophy, 
  Layout, 
  Save, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  Zap, 
  Flame, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Bell, 
  Calendar, 
  Maximize2, 
  Minimize2, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Users, 
  Crown, 
  ArrowRight, 
  UserCircle, 
  Copy, 
  AlertTriangle, 
  Download, 
  ShieldAlert, 
  Medal, 
  Sparkles,
  Share,
  Camera,
  Star,
  Award,
  Moon,
  Briefcase,
  GraduationCap,
  Sword,
  Book,
  ArrowDown,
  Clock,
  Sun,
  Sunset,
  Sunrise,
  Repeat,
  Skull,
  ZapOff,
  BookOpen,
  HelpCircle,
  Navigation,
  Gift,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend
} from 'recharts';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithCustomToken, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  serverTimestamp, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

// --- Error Boundary Component (Prevents White Screen) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("CRITICAL UI ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-black text-red-500 p-8 flex flex-col items-center justify-center text-center font-mono">
          <ShieldAlert size={64} className="mb-6 animate-pulse" />
          <h1 className="text-3xl font-black mb-2 text-white">SYSTEM FAILURE</h1>
          <p className="text-zinc-500 text-xs mb-6">The interface crashed. Report the code below.</p>
          <div className="bg-zinc-900 border border-red-900/50 p-4 rounded-xl mb-6 max-w-full overflow-auto text-left w-full">
            <p className="text-red-400 text-xs break-all">
              {this.state.error && this.state.error.toString()}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black px-8 py-3 rounded-xl font-black hover:bg-zinc-200 transition-colors"
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

// --- Firebase Initialization ---
const getFirebaseConfig = () => {
  try {
    if (import.meta.env && import.meta.env.VITE_FIREBASE_API_KEY) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
    }
  } catch (e) {}
  if (typeof __firebase_config !== 'undefined') {
    return JSON.parse(__firebase_config);
  }
  return { apiKey: "PLACEHOLDER", projectId: "PLACEHOLDER" };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'me-supreme-tracker';

// --- Archetypes Configuration ---
const ARCHETYPES = {
  MONK: { 
    id: 'monk', 
    title: 'The Monk', 
    problem: "Distraction & Anxiety",
    solution: "Clarity & Peace",
    icon: Moon, 
    color: 'text-indigo-400', 
    manifesto: "I seek clarity in a chaotic world. Stillness is my strength.",
    defaults: [
      { name: "Meditation (20m)", goal: 30, timeOfDay: 'morning' },
      { name: "Digital Detox", goal: 30, timeOfDay: 'evening' },
      { name: "Reading (10 pages)", goal: 30, timeOfDay: 'anytime' }
    ]
  },
  WARRIOR: { 
    id: 'warrior', 
    title: 'The Warrior', 
    problem: "Weakness & Lethargy",
    solution: "Strength & Power",
    icon: Sword, 
    color: 'text-red-500', 
    manifesto: "I do not negotiate with myself. Pain is weakness leaving the body.",
    defaults: [
      { name: "Heavy Lifting", goal: 20, timeOfDay: 'morning' },
      { name: "Protein (150g)", goal: 30, timeOfDay: 'anytime' },
      { name: "Sleep 8h", goal: 30, timeOfDay: 'evening' }
    ]
  },
  FOUNDER: { 
    id: 'founder', 
    title: 'The Founder', 
    problem: "Stagnation & Poverty",
    solution: "Growth & Wealth",
    icon: Briefcase, 
    color: 'text-emerald-400', 
    manifesto: "I build the future. Every second is an investment.",
    defaults: [
      { name: "Deep Work (4h)", goal: 25, timeOfDay: 'morning' },
      { name: "Outreach", goal: 30, timeOfDay: 'afternoon' },
      { name: "Review KPIs", goal: 30, timeOfDay: 'evening' }
    ]
  },
  SCHOLAR: { 
    id: 'scholar', 
    title: 'The Scholar', 
    problem: "Ignorance & Confusion",
    solution: "Knowledge & Wisdom",
    icon: GraduationCap, 
    color: 'text-yellow-400', 
    manifesto: "I am a perpetual learner. Knowledge is my compounding asset.",
    defaults: [
      { name: "Study Session", goal: 25, timeOfDay: 'morning' },
      { name: "Read Research", goal: 30, timeOfDay: 'afternoon' },
      { name: "No Procrastination", goal: 30, timeOfDay: 'anytime' }
    ]
  }
};

// --- Utility Functions ---
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getDateKey = (date, day) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const getFullDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Calculate Streak for a habit
const calculateStreak = (history) => {
    let streak = 0;
    const today = new Date();
    // Check up to 365 days back
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = getFullDateKey(d);
        
        if (history && history[key]) {
            streak++;
        } else if (i === 0) {
            continue; 
        } else {
            break;
        }
    }
    return streak;
};

// Determine Rank based on Total XP
const getRankInfo = (totalCompleted) => {
    if (totalCompleted < 10) return { title: "Drifter", next: 10, color: "text-zinc-500", progress: (totalCompleted / 10) * 100 };
    if (totalCompleted < 50) return { title: "Novice", next: 50, color: "text-blue-400", progress: ((totalCompleted - 10) / 40) * 100 };
    if (totalCompleted < 100) return { title: "Initiate", next: 100, color: "text-green-400", progress: ((totalCompleted - 50) / 50) * 100 };
    if (totalCompleted < 250) return { title: "Operator", next: 250, color: "text-cyan-400", progress: ((totalCompleted - 100) / 150) * 100 };
    if (totalCompleted < 500) return { title: "Elite", next: 500, color: "text-purple-400", progress: ((totalCompleted - 250) / 250) * 100 };
    if (totalCompleted < 1000) return { title: "Warlord", next: 1000, color: "text-orange-500", progress: ((totalCompleted - 500) / 500) * 100 };
    return { title: "Supreme", next: 10000, color: "text-yellow-400", progress: 100 };
};

// Define Achievements
const ACHIEVEMENTS = [
    { id: 'first_blood', name: 'First Blood', desc: 'Complete your first habit', icon: Zap, condition: (habits) => habits.some(h => Object.keys(h.history).length > 0) },
    { id: 'streak_7', name: 'Week Warrior', desc: 'Reach a 7 day streak', icon: Flame, condition: (habits) => habits.some(h => calculateStreak(h.history) >= 7) },
    { id: 'streak_30', name: 'Iron Will', desc: 'Reach a 30 day streak', icon: ShieldCheck, condition: (habits) => habits.some(h => calculateStreak(h.history) >= 30) },
    { id: 'mastery', name: 'Protocol Master', desc: 'Complete 100 total reps', icon: Trophy, condition: (habits) => {
        const total = habits.reduce((acc, h) => acc + Object.keys(h.history).length, 0);
        return total >= 100;
    }},
    { id: 'dedication', name: 'Full House', desc: '5 Active Habits', icon: Grid, condition: (habits) => habits.length >= 5 }
];

// --- Components ---

// NEW: Toast Notification for Token Gain
const TokenToast = ({ visible }) => {
    if (!visible) return null;
    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in zoom-in slide-in-from-top-4 duration-500 pointer-events-none w-[90%] max-w-sm">
            <div className="bg-lime-900/90 border border-lime-400/50 text-lime-400 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(163,230,53,0.3)] flex items-center gap-3 backdrop-blur-md">
                <div className="bg-lime-400 text-black p-2 rounded-lg">
                    <Gift size={24} strokeWidth={3} />
                </div>
                <div>
                    <h4 className="font-black text-sm uppercase tracking-wider">Supply Drop</h4>
                    <p className="text-xs text-lime-200 font-mono font-bold">+1 FORGIVENESS TOKEN EARNED</p>
                </div>
            </div>
        </div>
    );
};

// Game-like Highlight Tour Overlay
const GameTutorial = ({ isActive, onComplete }) => {
    const [step, setStep] = useState(0);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const STEPS = [
        {
            target: 'tour-rank-card',
            title: "YOUR STATUS",
            text: "This is your current Rank. As you complete habits, you gain XP. Earning XP unlocks new ranks from 'Drifter' to 'Supreme'.",
            position: 'bottom'
        },
        {
            target: 'tour-grid',
            title: "THE GRID",
            text: "Your command center. Each row is a habit, each box is a day. Click a box to toggle it. Green means done. Red means missed.",
            position: 'top'
        },
        {
            target: 'tour-add-btn',
            title: "EXPAND PROTOCOL",
            text: "Click here to add new habits. You can choose between 'Motivation' (easy) or 'Discipline' (hard) modes.",
            position: 'bottom'
        },
        {
            target: 'tour-nav-squad',
            title: "SQUAD SYNC",
            text: "Don't fight alone. Click the Squad tab to create a leaderboard with friends or family.",
            position: 'top'
        }
    ];

    useEffect(() => {
        if (!isActive) return;
        
        const updatePosition = () => {
            const currentStep = STEPS[step];
            if (!currentStep) return;
            const element = document.getElementById(currentStep.target);
            if (element) {
                try {
                    const rect = element.getBoundingClientRect();
                    // Check if element is actually visible/rendered to avoid 0x0 box
                    if (rect.width > 0 && rect.height > 0) {
                        setCoords({
                            top: rect.top, 
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                            bottom: rect.bottom
                        });
                    }
                } catch (e) {
                    console.error("Tutorial highlight error:", e);
                }
            }
        };

        // Delay initial calculation to allow mobile render
        const initTimer = setTimeout(() => {
             const currentStep = STEPS[step];
             if (!currentStep) return;
             const element = document.getElementById(currentStep.target);
             if(element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  updatePosition();
             }
        }, 1000); // Increased delay for mobile robustness

        // Continuously update position
        const interval = setInterval(updatePosition, 100);

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition);
        
        return () => {
            clearTimeout(initTimer);
            clearInterval(interval);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        }
    }, [step, isActive]);

    if (!isActive) return null;
    
    // Safety check: if coords are 0 (element not found), don't show tooltip yet
    if (coords.width === 0) return null;

    const currentStep = STEPS[step];
    if (!currentStep) return null;

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
            {/* The Backdrop */}
            <div 
                className="absolute transition-all duration-300 ease-out border-2 border-lime-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] pointer-events-auto"
                style={{
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                    height: coords.height,
                }}
            >
                <div className="absolute inset-0 bg-lime-400/10 animate-pulse rounded-lg pointer-events-none"></div>
            </div>

            {/* The Tooltip */}
            <div 
                className="absolute transition-all duration-300 z-[10000] max-w-xs w-full pointer-events-auto px-4"
                style={{
                    top: currentStep.position === 'bottom' ? coords.top + coords.height + 20 : 
                         currentStep.position === 'top' ? coords.top - 20 : 
                         coords.top,
                    left: '50%', // Center horizontally on mobile
                    transform: `translateX(-50%) ${currentStep.position === 'top' ? 'translateY(-100%)' : ''}`
                }}
            >
                <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-2xl relative w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-lime-400 rounded-full animate-ping"></div>
                        <h3 className="text-lime-400 font-black text-sm tracking-widest uppercase">{currentStep.title}</h3>
                    </div>
                    <p className="text-white text-sm mb-6 leading-relaxed">
                        {currentStep.text}
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500 font-mono">STEP {step + 1}/{STEPS.length}</p>
                        <button 
                            onClick={handleNext}
                            className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors"
                        >
                            {step === STEPS.length - 1 ? 'FINISH' : 'NEXT'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Reflection Modal (Failure Management)
const ReflectionModal = ({ isOpen, onClose, onRecover, tokens }) => {
    if (!isOpen) return null;
    const reasons = ["Sleep / Fatigue", "Stress / Anxiety", "Travel", "Forgot", "Just Lazy"];

    return (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-zinc-900 border border-red-500/30 w-full max-w-md rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <Skull size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">PROTOCOL BREACH DETECTED</h2>
                    <p className="text-zinc-400 text-sm">Honesty is the first step to recovery. What caused this failure?</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                    {reasons.map((r) => (
                        <button key={r} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors border border-zinc-700 hover:border-zinc-500">
                            {r}
                        </button>
                    ))}
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-500">FORGIVENESS TOKENS</span>
                        <span className={`text-xs font-mono font-bold ${tokens > 0 ? 'text-lime-400' : 'text-red-500'}`}>
                            {tokens} AVAILABLE
                        </span>
                    </div>
                    <button 
                        onClick={onRecover}
                        disabled={tokens <= 0}
                        className={`w-full py-3 border font-bold rounded-lg transition-all flex items-center justify-center gap-2
                            ${tokens > 0 
                                ? 'bg-lime-400/10 border-lime-400/50 text-lime-400 hover:bg-lime-400 hover:text-black' 
                                : 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed'}
                        `}
                    >
                        <Repeat size={16} /> {tokens > 0 ? "USE TOKEN & REPAIR STREAK" : "INSUFFICIENT TOKENS"}
                    </button>
                </div>

                <button onClick={onClose} className="w-full py-3 text-zinc-500 text-xs font-bold hover:text-white">
                    ACCEPT FAILURE (LOSE XP)
                </button>
            </div>
        </div>
    )
}

// User Guide / Manual Component
const UserGuide = ({ isOpen, onClose }) => {
    const [page, setPage] = useState(0);

    if (!isOpen) return null;

    const pages = [
        {
            title: "WELCOME TO THE GRID",
            icon: Grid,
            color: "text-lime-400",
            content: "You are now operating on Tracker.OS. This is not a todo list. It is a visual database of your consistency. Every box you fill adds to your momentum."
        },
        {
            title: "TRACKING PROTOCOLS",
            icon: Check,
            color: "text-cyan-400",
            content: "Click a box on 'The Grid' to mark a habit as complete. Dark cells are future days (locked). Red cells are missed days. Maintain the streak to earn XP."
        },
        {
            title: "XP & RANKING",
            icon: Trophy,
            color: "text-yellow-400",
            content: "Every completion grants XP. As you gain XP, your Rank increases from 'Drifter' to 'Supreme'. Unlock badges and prove your discipline."
        },
        {
            title: "SQUAD SYNC",
            icon: Users,
            color: "text-purple-400",
            content: "Don't fight alone. Go to the Squad tab to create a family or team leaderboard. Share your code to compete live with friends."
        }
    ];

    const current = pages[page];

    return (
        <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24}/></button>
                
                <div className="h-2 bg-zinc-800 w-full">
                    <div 
                        className="h-full bg-lime-400 transition-all duration-300" 
                        style={{ width: `${((page + 1) / pages.length) * 100}%`}}
                    ></div>
                </div>

                <div className="p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                    <div className={`w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 border border-zinc-700 shadow-xl ${current.color}`}>
                        <current.icon size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-4 tracking-tight">{current.title}</h2>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mb-8">{current.content}</p>

                    <div className="flex items-center gap-4 w-full">
                        {page > 0 && (
                            <button 
                                onClick={() => setPage(p => p - 1)}
                                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-700 transition-colors"
                            >
                                BACK
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                if (page < pages.length - 1) {
                                    setPage(p => p + 1);
                                } else {
                                    onClose();
                                }
                            }}
                            className="flex-1 py-3 rounded-xl bg-lime-400 text-black font-black hover:bg-lime-300 transition-colors"
                        >
                            {page === pages.length - 1 ? "ENTER SYSTEM" : "NEXT"}
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
                    <p className="text-[10px] text-zinc-600 font-mono">USER MANUAL PAGE {page + 1} / {pages.length}</p>
                </div>
            </div>
        </div>
    )
}

// NEW: Onboarding Modal
const OnboardingModal = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [selectedArchetype, setSelectedArchetype] = useState(null);

    const handleSelect = (id) => {
        setSelectedArchetype(id);
        setStep(2);
    };

    const handleCommit = () => {
        const arch = ARCHETYPES[selectedArchetype.toUpperCase()];
        onComplete(selectedArchetype, arch.defaults);
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
             <div className="max-w-4xl w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col md:flex-row h-[85vh] animate-in zoom-in-95 duration-300">
                 <div className="w-full md:w-1/3 bg-zinc-950 p-8 flex flex-col justify-between border-r border-zinc-800">
                      <div>
                          <div className="flex items-center gap-2 mb-6">
                              <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center font-black text-black">M</div>
                              <span className="font-bold text-white tracking-tight">TRACKER.OS</span>
                          </div>
                          <h1 className="text-3xl font-black text-white mb-4 leading-tight">
                              {step === 1 ? "IDENTIFY YOUR MISSION" : "CONFIRM PROTOCOL"}
                          </h1>
                          <p className="text-zinc-400 text-sm leading-relaxed">
                              {step === 1 
                                ? "What problem are you trying to solve? Select the archetype that aligns with your current goal."
                                : `The ${ARCHETYPES[selectedArchetype?.toUpperCase()]?.title} follows a strict code. Are you ready to commit?`
                              }
                          </p>
                      </div>
                      <div className="space-y-4">
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full bg-lime-400 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                          </div>
                          <p className="text-xs text-zinc-500 font-mono text-right">STEP {step} / 2</p>
                      </div>
                 </div>

                 <div className="flex-1 p-8 overflow-y-auto bg-black custom-scrollbar">
                     {step === 1 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {Object.values(ARCHETYPES).map((arch) => (
                                 <button 
                                    key={arch.id}
                                    onClick={() => handleSelect(arch.id)}
                                    className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-lime-500/50 transition-all text-left group relative overflow-hidden flex flex-col h-full"
                                 >
                                      <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
                                      <div className="flex justify-between items-start mb-4">
                                         <div className={`w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center ${arch.color}`}>
                                             <arch.icon size={24} />
                                         </div>
                                         <div className="bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                                             {arch.title} Pack
                                         </div>
                                      </div>
                                      
                                      <h3 className="text-xl font-bold text-white mb-1">{arch.solution}</h3>
                                      <p className="text-xs text-red-400/80 font-mono mb-4">Fixes: {arch.problem}</p>
                                      <p className="text-xs text-zinc-500 italic mb-4 flex-grow">"{arch.manifesto}"</p>
                                      
                                      <div className="border-t border-zinc-800 pt-4 mt-auto">
                                         <p className="text-[10px] uppercase font-bold text-zinc-600 mb-2">Includes:</p>
                                         <ul className="space-y-1">
                                             {arch.defaults.map((h, i) => (
                                                 <li key={i} className="text-xs text-zinc-400 flex items-center gap-2">
                                                     <Check size={10} className="text-lime-500"/> {h.name}
                                                 </li>
                                             ))}
                                         </ul>
                                      </div>
                                 </button>
                             ))}
                         </div>
                     ) : (
                         <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right">
                             <div className={`w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                                 {(() => {
                                     const Icon = ARCHETYPES[selectedArchetype.toUpperCase()].icon;
                                     return <Icon size={48} className={ARCHETYPES[selectedArchetype.toUpperCase()].color} />;
                                 })()}
                             </div>
                             <h2 className="text-2xl font-black text-white mb-2">INITIALIZING...</h2>
                             <p className="text-zinc-400 max-w-md mb-8">
                                 We are about to install 3 core habits into your operating system.
                             </p>
                             <div className="flex gap-4">
                                 <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:text-white transition-colors">BACK</button>
                                 <button 
                                    onClick={handleCommit}
                                    className="px-8 py-3 bg-lime-400 text-black font-black rounded-xl hover:bg-lime-300 hover:scale-105 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)]"
                                 >
                                     BEGIN PROTOCOL
                                 </button>
                             </div>
                         </div>
                     )}
                 </div>
             </div>
        </div>
    )
}

// NEW: System Online / First Win Overlay
const SystemOnlineOverlay = () => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-none">
             <div className="text-center">
                 <div className="text-6xl mb-4 animate-bounce">🏆</div>
                 <h1 className="text-4xl md:text-6xl font-black text-lime-400 tracking-tighter mb-2 animate-in zoom-in duration-300">SYSTEM ONLINE</h1>
                 <p className="text-white font-mono text-xl tracking-widest mb-8">PROTOCOL INITIATED</p>
                 <div className="bg-zinc-800 text-lime-400 px-6 py-2 rounded-full font-bold inline-block border border-lime-400/30 shadow-[0_0_30px_rgba(163,230,53,0.4)]">
                     +100 XP ACQUIRED
                 </div>
             </div>
        </div>
    )
}

// Share Modal (Flex Card)
const ShareModal = ({ isOpen, onClose, rankInfo, totalXP, habits }) => {
    if (!isOpen) return null;

    const topHabit = [...habits].sort((a, b) => calculateStreak(b.history) - calculateStreak(a.history))[0];
    const streak = topHabit ? calculateStreak(topHabit.history) : 0;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm">
                <button onClick={onClose} className="absolute -top-12 right-0 text-white hover:text-red-500"><X size={24}/></button>
                
                {/* The Card to Screenshot */}
                <div className="bg-zinc-900 border-4 border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lime-400 via-emerald-500 to-cyan-500"></div>
                    
                    {/* Header */}
                    <div className="p-8 pb-4 text-center">
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">TRACKER<span className="text-lime-400">.OS</span></h2>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-[0.3em]">Status Report</p>
                    </div>

                    {/* Rank */}
                    <div className="px-8 py-4 flex flex-col items-center">
                        <Medal size={64} className="text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                        <h1 className={`text-4xl font-black ${rankInfo.color} uppercase tracking-tighter mb-2`}>{rankInfo.title}</h1>
                        <div className="bg-zinc-800 px-4 py-1 rounded-full border border-zinc-700">
                            <span className="text-white font-mono font-bold">{totalXP} XP EARNED</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-px bg-zinc-800 mt-6 border-t border-zinc-800">
                        <div className="bg-zinc-900 p-6 text-center">
                            <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-1">Top Streak</p>
                            <p className="text-3xl font-black text-white flex items-center justify-center gap-1">
                                {streak} <Flame size={20} className="text-orange-500 fill-orange-500"/>
                            </p>
                        </div>
                        <div className="bg-zinc-900 p-6 text-center">
                            <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest mb-1">Active Protocols</p>
                            <p className="text-3xl font-black text-white">{habits.length}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-black/50 text-center">
                        <p className="text-[9px] text-zinc-600 font-mono">GENERATED BY TRACKER.OS</p>
                    </div>
                </div>

                <div className="mt-6 text-center">
                      <p className="text-zinc-400 text-xs mb-3">Take a screenshot to share</p>
                      <button onClick={onClose} className="bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-zinc-200 transition-colors w-full">
                          DONE
                      </button>
                </div>
            </div>
        </div>
    )
}

// Achievement Modal
const AchievementsView = ({ habits, totalXP }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {ACHIEVEMENTS.map(ach => {
                const isUnlocked = ach.condition(habits);
                return (
                    <div key={ach.id} className={`p-4 rounded-2xl border transition-all relative overflow-hidden group
                        ${isUnlocked ? 'bg-zinc-900 border-lime-500/30' : 'bg-black border-zinc-800 opacity-60'}
                    `}>
                        {isUnlocked && <div className="absolute top-0 left-0 w-full h-1 bg-lime-500"></div>}
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-lime-400/10 text-lime-400' : 'bg-zinc-800 text-zinc-600'}`}>
                                <ach.icon size={18} />
                            </div>
                            {isUnlocked && <Check size={14} className="text-lime-400 absolute top-3 right-3" />}
                        </div>
                        <h4 className={`font-bold text-xs ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>{ach.name}</h4>
                        <p className="text-[10px] text-zinc-500 leading-tight mt-1">{ach.desc}</p>
                    </div>
                )
            })}
        </div>
    )
}

// 0. New Habit Modal (Updated with Time of Day)
const NewHabitModal = ({ isOpen, onClose, onConfirm }) => {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [mode, setMode] = useState(null); // 'motivation' | 'discipline'
    const [showLecture, setShowLecture] = useState(false);
    const [timeOfDay, setTimeOfDay] = useState('anytime');

    if (!isOpen) return null;

    const handleModeSelect = (selectedMode) => {
        if (selectedMode === 'motivation') {
            setShowLecture(true);
        } else {
            setMode('discipline');
        }
    };

    const handleSubmit = () => {
        if (!name) return;
        onConfirm(name, parseInt(goal) || 0, timeOfDay);
        setName('');
        setGoal('');
        setMode(null);
        setShowLecture(false);
        setTimeOfDay('anytime');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                
                <h2 className="text-xl font-black text-white mb-1 uppercase tracking-wider">Initialize Protocol</h2>
                <p className="text-zinc-500 text-xs mb-6">Define your new habit parameters.</p>

                {!mode && !showLecture && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Habit Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none"
                                placeholder="e.g. 5AM Run"
                            />
                        </div>
                        
                        {/* Time of Day Context */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Time Constraint</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'morning', icon: Sunrise, label: 'AM' },
                                    { id: 'afternoon', icon: Sun, label: 'Mid' },
                                    { id: 'evening', icon: Sunset, label: 'PM' },
                                    { id: 'anytime', icon: Clock, label: 'Any' },
                                ].map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => setTimeOfDay(t.id)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${timeOfDay === t.id ? 'bg-zinc-800 border-lime-400 text-lime-400' : 'bg-black border-zinc-700 text-zinc-500'}`}
                                    >
                                        <t.icon size={16} />
                                        <span className="text-[10px] font-bold mt-1">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Monthly Target (Days)</label>
                            <input 
                                type="number" 
                                value={goal}
                                onChange={e => setGoal(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none"
                                placeholder="0 = Every Day"
                            />
                        </div>
                        <div className="pt-4">
                            <p className="text-center text-zinc-300 text-sm font-bold mb-4">What fuels this habit?</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleModeSelect('motivation')}
                                    className="p-4 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 hover:border-pink-500 text-pink-200 font-bold text-sm transition-all"
                                >
                                    Motivation 
                                    <span className="block text-[9px] font-normal opacity-70 mt-1">"I feel like doing it"</span>
                                </button>
                                <button 
                                    onClick={() => handleModeSelect('discipline')}
                                    className="p-4 rounded-xl bg-gradient-to-br from-lime-500/20 to-emerald-500/20 border border-lime-500/30 hover:border-lime-500 text-lime-200 font-bold text-sm transition-all"
                                >
                                    Discipline
                                    <span className="block text-[9px] font-normal opacity-70 mt-1">"I must do it"</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showLecture && (
                    <div className="text-center py-8 animate-in zoom-in-95">
                        <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">SYSTEM ALERT</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                            Motivation is a feeling. Feelings are temporary.<br/>
                            Discipline is a system. Systems last forever.
                        </p>
                        <button 
                            onClick={() => setShowLecture(false)}
                            className="px-6 py-2 bg-zinc-800 text-white text-xs font-bold rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-600"
                        >
                            GO BACK
                        </button>
                    </div>
                )}

                {mode === 'discipline' && !showLecture && (
                    <div className="text-center py-6 animate-in slide-in-from-right">
                        <ShieldCheck size={48} className="text-lime-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">PROTOCOL ACCEPTED</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            You have chosen the hard path. Good.<br/>
                        </p>
                        <button 
                            onClick={handleSubmit}
                            disabled={!name}
                            className="w-full bg-lime-400 text-black font-black py-4 rounded-xl hover:bg-lime-300 transition-colors"
                        >
                            CONFIRM & COMMIT
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// 1. Login Screen
const LoginView = ({ onLogin, onLocalMode, error, isConfigured }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [validationMsg, setValidationMsg] = useState('');

  const validateAndSubmit = (action) => {
      if (!firstName.trim() || !lastName.trim()) {
          setValidationMsg("Identity Protocol Failed: Name & Surname Required");
          return;
      }
      setValidationMsg('');
      action({ firstName: firstName.trim(), lastName: lastName.trim() });
  };

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center p-4 text-white relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.1),rgba(0,0,0,1))] pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-lime-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-zinc-900/60 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/10 relative z-10 animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center">
        <div className="w-20 h-20 mb-6 relative group">
            <div className="absolute inset-0 bg-lime-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="w-full h-full bg-gradient-to-br from-lime-400 to-emerald-500 rounded-3xl flex items-center justify-center relative shadow-2xl transform transition-transform group-hover:scale-105 group-hover:rotate-3">
                 <span className="font-black text-4xl text-black">M</span>
            </div>
        </div>

        <h1 className="text-4xl font-black text-center mb-1 tracking-tighter text-white drop-shadow-lg">
            TRACKER<span className="text-lime-400">.OS</span>
        </h1>
        
        <div className="flex items-center gap-2 mb-8">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isConfigured ? 'bg-lime-500' : 'bg-red-500'}`}></span>
            <p className={`text-xs font-bold tracking-[0.2em] uppercase ${isConfigured ? 'text-zinc-400' : 'text-red-400'}`}>
                Status: {isConfigured ? 'Database Connected' : 'Env Config Missing'}
            </p>
        </div>
        
        <div className="w-full space-y-3 mb-6">
            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest pl-2">Operative Identity</label>
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <UserCircle size={16} className="absolute left-3 top-3.5 text-zinc-500"/>
                    <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Name" 
                        className="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 pl-10 pr-3 text-sm text-white placeholder-zinc-600 focus:border-lime-400 focus:ring-0 outline-none transition-all"
                    />
                </div>
                <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Surname" 
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-600 focus:border-lime-400 focus:ring-0 outline-none transition-all"
                />
            </div>
            {validationMsg && (
                <p className="text-red-400 text-[10px] uppercase font-bold tracking-wide text-center animate-pulse">{validationMsg}</p>
            )}
        </div>

        <div className="w-full space-y-4">
          <button 
            onClick={() => validateAndSubmit(onLogin)}
            disabled={!isConfigured}
            className={`w-full font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] group
                ${isConfigured ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
            `}
          >
            <Globe size={20} className={isConfigured ? "group-hover:rotate-12 transition-transform" : ""}/>
            {isConfigured ? 'INITIALIZE CLOUD SYNC' : 'CLOUD UNAVAILABLE'}
          </button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-transparent px-3 text-zinc-500">Or Access Local Storage</span>
            </div>
          </div>

          <button 
            onClick={() => validateAndSubmit(onLocalMode)}
            className="w-full bg-black/50 hover:bg-black/70 text-zinc-300 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] border border-white/10 group"
          >
            <Cpu size={20} className="text-lime-400 group-hover:animate-spin-slow"/>
            DEVICE STORAGE MODE
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs text-center font-bold uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck size={16} /> {error}
          </div>
        )}

        {!isConfigured && (
            <p className="mt-4 text-[10px] text-zinc-600 text-center max-w-xs leading-relaxed">
                Database link not detected. To enable cloud features, ensure your <span className="text-zinc-400 font-mono">.env</span> file is configured correctly.
            </p>
        )}
        
        <div className="mt-8 flex items-center justify-between w-full px-4 opacity-30 hover:opacity-100 transition-opacity">
            <p className="text-[9px] text-zinc-500 font-mono">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            <p className="text-[9px] text-zinc-500 font-mono">SECURE.ENCRYPTED</p>
        </div>
      </div>
    </div>
  );
};

// 4. Squad / Family View
const SquadView = ({ user, userProfile, onJoinSquad }) => {
    const [joinCode, setJoinCode] = useState('');
    const [members, setMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('join');
    
    useEffect(() => {
        if (!user || !userProfile?.squadId) return;

        if (user.uid === 'local-user') {
            setMembers([{
                uid: 'local-user',
                displayName: userProfile.displayName || 'Local Operator',
                todayScore: userProfile.todayScore || 0,
                lastActive: { toMillis: () => Date.now() }
            }]);
            return;
        }

        const q = query(
            collection(db, 'artifacts', appId, 'users'), 
            where('squadId', '==', userProfile.squadId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const mems = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
            mems.sort((a, b) => (b.todayScore || 0) - (a.todayScore || 0));
            setMembers(mems);
        });

        return () => unsubscribe();
    }, [user, userProfile]);

    const handleJoin = (e) => {
        e.preventDefault();
        if(!joinCode.trim()) return;
        onJoinSquad(joinCode.trim().toUpperCase());
    };

    const handleCreate = () => {
        const code = 'SQ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        onJoinSquad(code);
    };

    const copySquadCode = () => {
        if (userProfile?.squadId) {
            navigator.clipboard.writeText(userProfile.squadId);
        }
    }

    if (!userProfile?.squadId) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] animate-in fade-in slide-in-from-bottom-4 p-4">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-400 to-cyan-500"></div>
                      <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Users size={32} className="text-lime-400" />
                      </div>
                      <h2 className="text-3xl font-black text-white mb-2 tracking-tight">SQUAD PROTOCOL</h2>
                      <p className="text-zinc-400 mb-8 text-sm">Synchronize with family or friends. Compete for dominance.</p>
                      
                      {user.uid === 'local-user' && (
                          <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-xs font-bold uppercase tracking-wide">
                              ⚠ Local Mode Active: You will only see your own stats. Sign in with Google to sync with others.
                          </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-xl mb-6">
                          <button 
                            onClick={() => setActiveTab('join')}
                            className={`py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === 'join' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                              Join Squad
                          </button>
                          <button 
                            onClick={() => setActiveTab('create')}
                            className={`py-2 text-xs font-bold uppercase rounded-lg transition-all ${activeTab === 'create' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                              Create Squad
                          </button>
                      </div>

                      {activeTab === 'join' ? (
                        <form onSubmit={handleJoin} className="space-y-4 animate-in fade-in zoom-in-95">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 block text-left">Enter Access Code</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        placeholder="e.g. SQ-XY92Z"
                                        className="w-full bg-black border border-zinc-700 rounded-xl p-4 text-center font-black text-xl text-white uppercase placeholder-zinc-800 focus:border-lime-400 focus:ring-0 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-lime-400 transition-colors flex items-center justify-center gap-2"
                            >
                                {user.uid === 'local-user' ? 'ACTIVATE SOLO SQUAD' : 'JOIN SQUAD'} <ArrowRight size={18} strokeWidth={3}/>
                            </button>
                        </form>
                      ) : (
                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                            <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                                <p className="text-zinc-400 text-xs mb-2">Initialize a new secure channel for your team.</p>
                                <div className="flex items-center justify-center gap-2 text-lime-400/50">
                                    <ShieldCheck size={20} />
                                    <span className="text-xs font-mono">ENCRYPTED CHANNEL</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleCreate}
                                className="w-full bg-lime-400 text-black font-black py-4 rounded-xl hover:bg-lime-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                            >
                                GENERATE NEW SQUAD <Plus size={18} strokeWidth={3}/>
                            </button>
                        </div>
                      )}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-zinc-900 border-b border-zinc-800 p-6 rounded-t-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Users className="text-lime-400"/> {userProfile.squadId}
                        </h2>
                        {user.uid !== 'local-user' && (
                            <button 
                                onClick={copySquadCode}
                                className="p-1.5 bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" 
                                title="Copy Code"
                            >
                                <Copy size={14}/>
                            </button>
                        )}
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">
                        {user.uid === 'local-user' ? 'Local Performance Record' : 'Live Family Leaderboard'}
                    </p>
                </div>
                <div className="bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-zinc-400 text-xs">Active Agents: </span>
                    <span className="text-white font-bold">{members.length}</span>
                </div>
            </div>

            {/* Squad Engagement Addon */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-x border-zinc-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
                        <Target className="text-yellow-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wide">Weekly Challenge</h4>
                        <p className="text-zinc-500 text-xs">Everyone must complete <span className="text-white font-bold">5 Workouts</span> this week.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-500">REWARD:</span>
                    <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/20">+500 XP</span>
                </div>
            </div>

            <div className="bg-zinc-900 border-x border-b border-zinc-800 rounded-b-3xl p-4 space-y-2 min-h-[400px]">
                {members.map((member, index) => (
                    <div 
                        key={member.uid} 
                        className={`p-4 rounded-2xl flex items-center gap-4 transition-all
                            ${member.uid === user.uid ? 'bg-lime-900/10 border border-lime-500/30' : 'bg-black border border-zinc-800'}
                        `}
                    >
                        <div className="w-8 h-8 flex items-center justify-center font-black text-lg italic text-zinc-500">
                            {index === 0 ? <Crown size={24} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"/> : `#${index + 1}`}
                        </div>
                        
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-lg border-2 border-zinc-700 overflow-hidden relative shadow-lg">
                             <span className="text-white">{member.displayName ? member.displayName[0].toUpperCase() : 'U'}</span>
                             {member.lastActive && (Date.now() - member.lastActive.toMillis() < 300000) && (
                                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-lime-500 rounded-full border-2 border-black"></div>
                             )}
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                                {member.displayName || 'Unknown Warrior'}
                                {member.uid === user.uid && <span className="text-[9px] bg-lime-400 text-black px-1.5 py-0.5 rounded font-black tracking-wider">YOU</span>}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden max-w-[120px]">
                                    <div 
                                        className="h-full bg-gradient-to-r from-lime-400 to-cyan-400" 
                                        style={{ width: `${Math.min(100, (member.todayScore || 0) * 10)}%` }} 
                                    ></div>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono">STATUS: {member.todayScore > 0 ? 'ACTIVE' : 'IDLE'}</span>
                            </div>
                        </div>

                        <div className="text-center min-w-[60px]">
                            <span className="block text-2xl font-black text-white">{member.todayScore || 0}</span>
                            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Points</span>
                        </div>
                    </div>
                ))}
                {members.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">
                        <p>Waiting for squad members to join...</p>
                        <p className="text-xs mt-2">Share code: <span className="text-white font-mono bg-zinc-800 px-2 py-1 rounded">{userProfile.squadId}</span></p>
                    </div>
                )}
            </div>
        </div>
    );
};

// 1. Digital Tracker (Gen Z Dark Mode) - Updated with TutorialMode prop
const TrackerView = ({ habits, currentDate, onToggle, onOpenNewHabit, onDelete, onUpdateField, tutorialMode, onRepairStreak }) => {
  const daysInMonth = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const getDayLabel = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toLocaleDateString('en-US', { weekday: 'narrow' });
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const isFutureDate = (day) => {
      const today = new Date();
      const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return checkDate > todayDate;
  };

  const handleDeleteClick = (id) => {
      if (deleteConfirmId === id) {
          onDelete(id);
          setDeleteConfirmId(null);
      } else {
          setDeleteConfirmId(id);
          setTimeout(() => setDeleteConfirmId(null), 3000);
      }
  };

  return (
    <div id="tour-grid" className="flex flex-col h-full bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800/50 overflow-hidden relative">
      {/* Visual Indicator that System is Secured */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r transition-all duration-500 z-30 from-red-500 via-orange-500 to-yellow-500`}></div>

      <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/80 backdrop-blur-sm z-20">
        <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
          <Grid size={24} className="text-red-500" />
          THE GRID
        </h2>
        
        <div className="flex items-center gap-3">
            {/* Strict Mode Indicator - System is always strict */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10">
                <Lock size={12} className="text-red-500" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Protocol Locked</span>
            </div>

            <button 
            id="tour-add-btn"
            onClick={onOpenNewHabit}
            className="flex items-center gap-2 px-5 py-2.5 bg-lime-400 text-black rounded-xl hover:bg-lime-300 transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] text-sm font-bold hover:scale-105 active:scale-95"
            >
            <Plus size={18} strokeWidth={3} /> NEW HABIT
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative custom-scrollbar bg-black/20">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-900 sticky top-0 z-20 shadow-lg">
            <tr>
              <th className="p-4 text-left font-bold text-zinc-500 min-w-[200px] md:min-w-[240px] sticky left-0 bg-zinc-900 z-30 border-r border-zinc-800/50 uppercase text-xs tracking-wider">
                Protocol Name
              </th>
              <th className="p-2 text-center font-bold text-zinc-600 w-[70px] border-r border-zinc-800/50 text-[10px] uppercase tracking-wider">
                Target
              </th>
              {daysArray.map(day => (
                <th key={day} className={`p-1 min-w-[36px] md:min-w-[40px] text-center border-r border-zinc-800/30 ${isToday(day) ? 'bg-lime-900/20 text-lime-400' : 'text-zinc-600'}`}>
                  <div className="text-[9px] font-black uppercase mb-0.5 opacity-70">{getDayLabel(day)}</div>
                  <div className={`text-xs font-bold ${isToday(day) ? 'text-lime-400' : 'text-zinc-400'}`}>{day}</div>
                </th>
              ))}
              <th className="p-2 min-w-[70px] text-center text-zinc-500 font-bold sticky right-0 bg-zinc-900 z-20 border-l border-zinc-800/50 text-[10px] uppercase tracking-wider">
                Score
              </th>
              <th className="p-2 min-w-[40px] sticky right-0 bg-zinc-900 z-20"></th>
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 4} className="p-20 text-center">
                  <div className="flex flex-col items-center justify-center opacity-30 animate-pulse">
                      <Grid size={48} className="mb-4 text-white"/>
                      <p className="text-zinc-300 font-bold text-lg">GRID EMPTY</p>
                      <p className="text-zinc-500 text-sm">Initialize your first protocol to begin.</p>
                  </div>
                </td>
              </tr>
            ) : (
              habits.map((habit, index) => {
                const totalCompleted = daysArray.reduce((acc, day) => {
                  return acc + (habit.history?.[getDateKey(currentDate, day)] ? 1 : 0);
                }, 0);
                
                const effectiveGoal = (habit.goal && habit.goal > 0) ? habit.goal : daysInMonth;
                const percent = Math.min(100, Math.round((totalCompleted / effectiveGoal) * 100));
                const isGoalMet = totalCompleted >= effectiveGoal;
                const streak = calculateStreak(habit.history);
                const isFirstHabitTutorial = tutorialMode && index === 0;

                // Time Icon Logic
                let TimeIcon = Clock;
                if(habit.timeOfDay === 'morning') TimeIcon = Sunrise;
                if(habit.timeOfDay === 'afternoon') TimeIcon = Sun;
                if(habit.timeOfDay === 'evening') TimeIcon = Sunset;

                return (
                  <tr key={habit.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group relative ${isFirstHabitTutorial ? 'bg-lime-900/10' : ''}`}>
                    <td className="p-2 sticky left-0 bg-zinc-900 group-hover:bg-zinc-800/90 z-10 border-r border-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-3 w-full">
                          <div className="flex-1 min-w-0 flex items-center gap-2">
                             {/* Streak Indicator */}
                             <div className="flex items-center gap-1 text-orange-500 shrink-0" title={`Current Streak: ${streak} days`}>
                                 <Flame size={14} className={streak > 0 ? "fill-orange-500 animate-pulse" : "text-zinc-700"} />
                                 <span className={`text-[10px] font-bold ${streak > 0 ? "text-orange-500" : "text-zinc-700"}`}>{streak}</span>
                             </div>
                             
                             <div className="text-zinc-600 shrink-0" title={habit.timeOfDay}>
                                <TimeIcon size={14} />
                             </div>

                             <input 
                                type="text" 
                                value={habit.name}
                                onChange={(e) => onUpdateField(habit.id, 'name', e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-zinc-200 font-bold placeholder-zinc-700 text-sm focus:text-lime-400 transition-colors truncate"
                                placeholder="PROTOCOL NAME..."
                             />
                          </div>
                      </div>
                    </td>
                    <td className="p-1 text-center border-r border-zinc-800/50">
                        <input 
                        type="number" 
                        value={(habit.goal && habit.goal > 0) ? habit.goal : ''}
                        onChange={(e) => onUpdateField(habit.id, 'goal', parseInt(e.target.value) || 0)}
                        className={`w-full text-center bg-transparent border-none focus:ring-0 font-mono text-xs font-bold ${habit.goal > 0 ? 'text-white' : 'text-zinc-600 italic'}`}
                        placeholder={daysInMonth} 
                      />
                    </td>
                    {daysArray.map(day => {
                      const dateKey = getDateKey(currentDate, day);
                      const isDone = habit.history?.[dateKey];
                      const isFuture = isFutureDate(day);
                      
                      // STRICT MODE ENFORCED: Always true for past days not today
                      const isPast = !isToday(day) && new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date();
                      
                      // Disable direct interaction if future
                      const isDisabled = isFuture; 
                      
                      // Tutorial Highlighting Logic
                      const isTutorialTarget = isFirstHabitTutorial && isToday(day);

                      return (
                        <td key={day} className={`p-0 text-center border-r border-zinc-800/30 ${isToday(day) ? 'bg-lime-900/10' : ''} ${isDisabled ? 'bg-black/40' : ''}`}>
                          <button
                            disabled={isDisabled}
                            onClick={() => {
                                if (isPast && !isDone) {
                                    onRepairStreak(habit.id, dateKey); // Trigger repair modal
                                } else {
                                    onToggle(habit.id, dateKey);
                                }
                            }}
                            className={`w-full h-10 md:h-12 flex items-center justify-center transition-all duration-300 relative group/btn
                                ${isDone ? 'bg-transparent' : 'hover:bg-zinc-800'}
                                ${isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}
                            `}
                          >
                            {isTutorialTarget && !isDone && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-bounce pointer-events-none">
                                    <span className="text-[9px] bg-lime-400 text-black font-bold px-1 rounded whitespace-nowrap mb-1">START HERE</span>
                                    <ArrowDown size={12} className="text-lime-400 fill-lime-400"/>
                                </div>
                            )}

                            {isDone ? (
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.6)] transform scale-110 transition-transform duration-200
                                    ${isDisabled ? 'bg-zinc-600 grayscale' : 'bg-lime-400 hover:scale-125 hover:rotate-3'}`}>
                                     <Check size={16} strokeWidth={4} className="text-black" />
                                </div>
                            ) : (
                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isTutorialTarget ? 'bg-lime-500 animate-ping' : (isDisabled ? 'bg-zinc-800' : 'bg-zinc-700 group-hover/btn:bg-zinc-600')}`}>
                                    {isPast && !isDone && (
                                        <div className="opacity-0 group-hover/btn:opacity-100 absolute inset-0 flex items-center justify-center text-[8px] text-red-500 font-bold">X</div>
                                    )}
                                </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-bold text-xs border-l border-zinc-800/50 bg-zinc-900 group-hover:bg-zinc-800/90 sticky right-0 z-10">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-base font-black ${isGoalMet ? 'text-lime-400' : 'text-white'}`}>
                          {percent}%
                        </span>
                        <span className="text-[9px] text-zinc-600 font-bold font-mono">
                          {totalCompleted}/{effectiveGoal}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-center bg-zinc-900 group-hover:bg-zinc-800/90 sticky right-0 z-10">
                      <button 
                        onClick={() => handleDeleteClick(habit.id)}
                        className={`transition-colors p-2 rounded-lg ${deleteConfirmId === habit.id ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-600 hover:text-red-500 hover:bg-red-500/10'}`}
                        title={deleteConfirmId === habit.id ? "Click again to confirm delete" : "Delete Habit"}
                      >
                        {deleteConfirmId === habit.id ? <AlertTriangle size={16} /> : <Trash2 size={16} />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 2. Analytics Dashboard (Gen Z Dark Mode)
const AnalyticsView = ({ habits, currentDate, onOpenShare, userProfile, onToggleHardcore }) => {
  const daysInMonth = getDaysInMonth(currentDate);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate Total XP
  const totalXP = habits.reduce((total, habit) => {
      return total + Object.values(habit.history || {}).filter(val => val === true).length;
  }, 0);
  
  const rankInfo = getRankInfo(totalXP);

  // -- Data Prep --
  const lineData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateKey = getDateKey(currentDate, day);
    const count = habits.reduce((acc, h) => acc + (h.history?.[dateKey] ? 1 : 0), 0);
    return { day, count };
  });

  const weeklyData = [];
  for (let i = 0; i < 4; i++) {
    const startDay = i * 7 + 1;
    const endDay = Math.min((i + 1) * 7, daysInMonth);
    let weekTotal = 0;
    for (let d = startDay; d <= endDay; d++) {
       const dateKey = getDateKey(currentDate, d);
       weekTotal += habits.reduce((acc, h) => acc + (h.history?.[dateKey] ? 1 : 0), 0);
    }
    weeklyData.push({ week: `WK ${i+1}`, completed: weekTotal });
  }

  // Calculate based on dynamic goals
  const totalGoals = habits.reduce((acc, h) => acc + ((h.goal && h.goal > 0) ? h.goal : daysInMonth), 0);
  
  const totalCompletedActual = habits.reduce((acc, h) => {
    let habitCount = 0;
    for(let i=1; i<=daysInMonth; i++) {
       if (h.history?.[getDateKey(currentDate, i)]) habitCount++;
    }
    return acc + habitCount;
  }, 0);
  
  const completionRate = totalGoals > 0 ? Math.round((totalCompletedActual / totalGoals) * 100) : 0;
  
  const sortedHabits = [...habits].sort((a, b) => {
    const getCount = (h) => {
      let c = 0;
      for(let i=1; i<=daysInMonth; i++) if (h.history?.[getDateKey(currentDate, i)]) c++;
      return c;
    };
    return getCount(b) - getCount(a);
  }).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 animate-fade-in mb-6">
      
      {/* 0. Rank Card with Share Button */}
      <div id="tour-rank-card" className="bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-800 col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Medal size={120} className="text-yellow-500" />
         </div>
         <div className="flex justify-between items-start">
             <div>
                <h3 className="text-zinc-500 font-bold mb-1 uppercase text-[10px] tracking-[0.2em]">Current Rank</h3>
                <h2 className={`text-4xl font-black ${rankInfo.color} tracking-tighter drop-shadow-lg`}>{rankInfo.title.toUpperCase()}</h2>
             </div>
             <button onClick={onOpenShare} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all" title="Share Status">
                 <Camera size={20} />
             </button>
         </div>
         
         <div className="mt-8">
             <div className="flex justify-between items-end mb-2">
                 <span className="text-white text-2xl font-black">{totalXP} <span className="text-sm font-bold text-zinc-500">XP</span></span>
                 <span className="text-zinc-500 text-xs font-mono">NEXT: {rankInfo.next}</span>
             </div>
             <div className="w-full h-4 bg-black rounded-full overflow-hidden border border-zinc-800">
                 <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" 
                    style={{ width: `${Math.min(100, rankInfo.progress)}%` }}
                 ></div>
             </div>
             <p className="text-[10px] text-zinc-500 mt-2 text-right">Complete habits to gain XP</p>
         </div>
      </div>

      {/* NEW: Identity & Hardcore Mode */}
      <div className={`bg-zinc-900 p-6 rounded-3xl shadow-2xl border col-span-1 md:col-span-1 lg:col-span-2 min-h-[300px] flex flex-col relative overflow-hidden
        ${userProfile?.hardcoreMode ? 'border-red-500/30' : 'border-zinc-800'}
      `}>
          <h3 className="text-zinc-500 font-bold mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
             <UserCircle size={14} className={userProfile?.hardcoreMode ? "text-red-500" : "text-zinc-400"} /> Identity Layer
          </h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                      <p className="text-xs text-zinc-500 font-mono mb-1">ARCHETYPE</p>
                      <p className="text-lg font-black text-white">
                        {userProfile?.archetype ? (ARCHETYPES[userProfile.archetype.toUpperCase()]?.title || 'UNKNOWN') : 'UNASSIGNED'}
                      </p>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-lg text-zinc-500">
                      {userProfile?.archetype && (() => {
                          const archKey = userProfile.archetype.toUpperCase();
                          const arch = ARCHETYPES[archKey];
                          const Icon = arch?.icon || UserCircle;
                          return <Icon size={20} />;
                      })()}
                  </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                      <p className="text-xs text-zinc-500 font-mono mb-1">FORGIVENESS TOKENS</p>
                      <p className="text-lg font-black text-lime-400">
                          {userProfile?.tokens !== undefined ? userProfile.tokens : 3}
                      </p>
                  </div>
                  <div className="p-2 bg-zinc-900 rounded-lg text-lime-400">
                      <Repeat size={20} />
                  </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div>
                      <p className="text-xs text-zinc-500 font-mono mb-1 flex items-center gap-2">
                          HARDCORE MODE
                          {userProfile?.hardcoreMode ? <Skull size={12} className="text-red-500"/> : <ZapOff size={12}/>}
                      </p>
                      <p className={`text-sm font-bold ${userProfile?.hardcoreMode ? 'text-red-400' : 'text-zinc-400'}`}>
                          {userProfile?.hardcoreMode ? 'Active: XP Penalty On' : 'Standard Protocol'}
                      </p>
                  </div>
                  <button 
                    onClick={onToggleHardcore}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all
                        ${userProfile?.hardcoreMode 
                            ? 'bg-red-500 text-white border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white'}
                    `}
                  >
                      {userProfile?.hardcoreMode ? 'DISABLE' : 'ENABLE'}
                  </button>
              </div>
          </div>
      </div>

      {/* 2. Consistency (Line) */}
      <div className="bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-800 col-span-1 md:col-span-2 lg:col-span-2 min-h-[300px] relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
             <h3 className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <TrendingUp size={14} className="text-fuchsia-500"/> Consistency Flow
             </h3>
        </div>
        
        <div className="h-60 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <defs>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a3e635" />
                        <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff'}}
                  itemStyle={{color: '#fff'}}
                  cursor={{stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="url(#lineColor)" 
                  strokeWidth={4} 
                  dot={false} 
                  activeDot={{r: 8, fill: '#fff', stroke: '#d946ef', strokeWidth: 3}} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Top Habits List */}
      <div className="bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-800 col-span-1 md:col-span-1 lg:col-span-3 min-h-[300px] overflow-hidden">
        <h3 className="text-zinc-500 font-bold mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
           <Trophy className="text-yellow-500" size={14} /> Leaderboard
        </h3>
        <div className="space-y-4">
          {sortedHabits.map((h, i) => {
             let count = 0;
             for(let d=1; d<=daysInMonth; d++) if(h.history?.[getDateKey(currentDate, d)]) count++;
             const goal = (h.goal && h.goal > 0) ? h.goal : daysInMonth;
             const pct = Math.min(100, Math.round((count / goal) * 100));
             
             return (
               <div key={h.id} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors
                    ${i === 0 ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.4)]' : 
                      i === 1 ? 'bg-zinc-700 text-white' : 
                      i === 2 ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-600'}
                  `}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                       <span className="font-bold text-zinc-200 text-sm truncate pr-2 group-hover:text-white transition-colors">{h.name}</span>
                       <span className="text-xs font-black text-lime-400 font-mono">{count}/{goal}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                       <div className="bg-gradient-to-r from-lime-400 to-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
               </div>
             );
          })}
          {sortedHabits.length === 0 && <p className="text-zinc-600 text-sm italic py-4 text-center">No data available.</p>}
        </div>
      </div>

        {/* 5. Weekly Breakdown (Bar) */}
        <div className="bg-zinc-900 p-6 rounded-3xl shadow-2xl border border-zinc-800 col-span-1 md:col-span-1 lg:col-span-3 min-h-[300px]">
            <h3 className="text-zinc-500 font-bold mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-cyan-400"/> Volume
            </h3>
            <div className="h-56 w-full">
            {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10, fontWeight: 'bold'}} />
                    <Tooltip 
                        cursor={{fill: '#27272a'}} 
                        contentStyle={{backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff'}}
                    />
                    <Bar dataKey="completed" fill="#22d3ee" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
                </ResponsiveContainer>
            )}
            </div>
        </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('main'); 
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [strictMode, setStrictMode] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  // New States for Onboarding/Gamification
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [showFirstWin, setShowFirstWin] = useState(false);
  const [showGuide, setShowGuide] = useState(false); 
  const [showTour, setShowTour] = useState(false);
  const [tokenToast, setTokenToast] = useState(false); 
  
  // Failure Recovery States
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [pendingRepair, setPendingRepair] = useState(null); // { habitId, dateKey }

  // ... (Hooks and Logic remain the same) ...
  // 1. Auth Listener
  useEffect(() => {
    if (firebaseConfig.apiKey === "PLACEHOLDER") {
      setLoading(false);
    }

    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
            await signInWithCustomToken(auth, __initial_auth_token);
        } catch(e) { console.error(e); }
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) setAuthError(null);
    });
    return () => unsubscribe();
  }, []);

  // PWA Install Prompt Listener
  useEffect(() => {
      const handler = (e) => {
          e.preventDefault();
          setInstallPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  // iOS Detection
  useEffect(() => {
    const isDeviceIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isDeviceIOS);
  }, []);

  // 2. Data Sync
  useEffect(() => {
    if (!user) return;
    
    if (user.uid === 'local-user') {
        try {
            const localData = localStorage.getItem('me_supreme_habits');
            const localStrict = localStorage.getItem('me_supreme_strict_mode');
            const localProfile = localStorage.getItem('me_supreme_profile');
            if (localData) {
                const parsedHabits = JSON.parse(localData);
                setHabits(parsedHabits);
                // Check if user has no habits & no profile setup -> Onboarding
                if (parsedHabits.length === 0 && !JSON.parse(localProfile || '{}').archetype) {
                    setIsOnboarding(true);
                }
            } else {
                 setIsOnboarding(true);
            }
            if (localStrict) setStrictMode(JSON.parse(localStrict));
            if (localProfile) setUserProfile(JSON.parse(localProfile));
        } catch (e) {
            console.error("Local storage load error", e);
        }
        return;
    }

    try {
      const q = query(
        collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), 
        orderBy('createdAt', 'asc')
      );

      const unsubscribeHabits = onSnapshot(q, (snapshot) => {
        const loadedHabits = snapshot.docs.map(doc => ({
          ...doc.data(), 
          id: doc.id,      
        }));
        setHabits(loadedHabits);
      });

      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
              const data = docSnap.data();
              setUserProfile(data);
              // Trigger onboarding if no archetype is set and habits are empty
              if (!data.archetype && habits.length === 0) {
                  setIsOnboarding(true);
              }
          } else {
              setDoc(userDocRef, { 
                  displayName: user.displayName || 'Anonymous Agent',
                  email: user.email,
                  joinedAt: serverTimestamp(),
                  tokens: 3 // Give 3 starter tokens
              }, { merge: true });
              setIsOnboarding(true);
          }
      });

      const savedStrict = localStorage.getItem('strictMode');
      if (savedStrict) setStrictMode(JSON.parse(savedStrict));

      return () => {
          unsubscribeHabits();
          unsubscribeProfile();
      };
    } catch (e) {
      console.warn("Firestore sync failed:", e);
    }
  }, [user]);

  // 3. Notifications Logic
  useEffect(() => {
    if (!user || habits.length === 0) return;
    
    if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
    }

    const checkAndNotify = () => {
        if (Notification.permission !== 'granted') return;

        const now = Date.now();
        const lastNotif = localStorage.getItem('lastNotificationTime');
        const fourHours = 4 * 60 * 60 * 1000;

        if (!lastNotif || (now - parseInt(lastNotif) > fourHours)) {
            const todayKey = getFullDateKey(new Date());
            const pendingCount = habits.reduce((acc, h) => {
                return acc + (h.history?.[todayKey] ? 0 : 1);
            }, 0);

            if (pendingCount > 0) {
                try {
                    new Notification("Tracker.OS Protocol Alert", {
                        body: `You have ${pendingCount} protocols pending. Maintain discipline.`,
                        icon: '/vite.svg' 
                    });
                    localStorage.setItem('lastNotificationTime', now.toString());
                } catch (e) {
                    console.error("Notification failed", e);
                }
            }
        }
    };

    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60 * 60 * 1000); 
    return () => clearInterval(interval);
  }, [user, habits]);

  const requestNotificationPermission = async () => {
      if (!('Notification' in window)) return;
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
  };

  const handleInstallApp = async () => {
      if (isIOS) {
          alert("To install on iOS: Tap the 'Share' button in Safari, then select 'Add to Home Screen'.");
          return;
      }
      if (!installPrompt) return;
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstallPrompt(null);
  };

  // --- Helpers ---
  const saveToLocal = (updatedHabits) => {
      setHabits(updatedHabits);
      localStorage.setItem('me_supreme_habits', JSON.stringify(updatedHabits));
  };

  const updateLocalProfile = (updates) => {
      const newProfile = { ...(userProfile || {}), ...updates };
      setUserProfile(newProfile);
      localStorage.setItem('me_supreme_profile', JSON.stringify(newProfile));
  };

  const toggleStrictMode = () => {
      const newVal = !strictMode;
      setStrictMode(newVal);
      localStorage.setItem('me_supreme_strict_mode', JSON.stringify(newVal));
      localStorage.setItem('strictMode', JSON.stringify(newVal));
  };

  // --- Auth Handlers ---
  const handleGoogleLogin = async (identityData) => {
    if (firebaseConfig.apiKey === "PLACEHOLDER") {
      setAuthError("Database not configured.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const displayName = `${identityData.firstName} ${identityData.lastName}`;
      await updateProfile(user, { displayName });
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await setDoc(userDocRef, { 
          displayName,
          email: user.email,
          lastActive: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error("Login failed:", error);
      setAuthError(error.message);
    }
  };

  const handleLocalMode = (identityData) => {
    const displayName = `${identityData.firstName} ${identityData.lastName}`;
    setUser({ uid: 'local-user', isAnonymous: true, displayName });
    const localProfile = JSON.parse(localStorage.getItem('me_supreme_profile') || '{}');
    const newProfile = { ...localProfile, displayName };
    localStorage.setItem('me_supreme_profile', JSON.stringify(newProfile));
    setUserProfile(newProfile);
  };

  const handleLogout = async () => {
    if (user?.uid === 'local-user') {
      setUser(null);
    } else {
      await signOut(auth);
    }
    setHabits([]);
    setUserProfile(null);
  };

  // --- Data Handlers ---
  const handleAddHabit = async (name, goal, timeOfDay = 'anytime') => {
    if (!user) return;
    const newHabitData = {
      name: name || `New Protocol ${habits.length + 1}`,
      goal: goal || 0,
      timeOfDay, 
      createdAt: serverTimestamp(), 
      history: {}
    };

    if (user.uid === 'local-user') {
        const localHabit = { 
            ...newHabitData, 
            id: `local-${Date.now()}`, 
            createdAt: new Date().toISOString() 
        };
        saveToLocal([...habits, localHabit]);
        return;
    }

    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), newHabitData);
  };

  const updateUserStats = async (updatedHabits) => {
      const todayKey = getFullDateKey(new Date());
      const todayScore = updatedHabits.reduce((acc, h) => {
          return acc + (h.history?.[todayKey] ? 1 : 0);
      }, 0);

      if (user.uid === 'local-user') {
          updateLocalProfile({ todayScore, lastActive: Date.now() });
      } else {
          const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
          await setDoc(userDocRef, { 
              todayScore, 
              lastActive: serverTimestamp(),
              displayName: user.displayName || 'Anonymous Agent'
          }, { merge: true });
      }
  };

  const handleToggleHabit = async (habitId, dateKey) => {
    if (!user) return;
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    const habit = habits[habitIndex];
    const newHistory = { ...habit.history };
    let isCompleting = false;

    if (newHistory[dateKey]) {
      delete newHistory[dateKey];
    } else {
      newHistory[dateKey] = true;
      isCompleting = true;
    }

    // First Win Trigger Logic
    if (tutorialMode && isCompleting) {
        setTutorialMode(false);
        setShowFirstWin(true);
        setTimeout(() => setShowFirstWin(false), 3500); // Hide reward after 3.5s
    }

    // TOKEN REWARD LOGIC: Earn 1 Token every 7-day streak
    const newStreak = calculateStreak(newHistory);
    // Only give token if completing, streak > 0, and streak is a multiple of 7
    if (isCompleting && newStreak > 0 && newStreak % 7 === 0) {
        const currentTokens = userProfile?.tokens !== undefined ? userProfile.tokens : 3;
        const newTokens = currentTokens + 1;
        
        if (user.uid === 'local-user') {
            updateLocalProfile({ tokens: newTokens });
        } else {
            const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
            await updateDoc(userDocRef, { tokens: newTokens });
        }
        
        // Show Token Toast
        setTokenToast(true);
        setTimeout(() => setTokenToast(false), 4000);
    }

    let updatedHabits = [...habits];
    updatedHabits[habitIndex] = { ...habit, history: newHistory };

    if (user.uid === 'local-user') {
        saveToLocal(updatedHabits);
    } else {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habitId);
        await updateDoc(docRef, { history: newHistory });
        setHabits(updatedHabits);
    }
    await updateUserStats(updatedHabits);
  };

  // NEW: Repair Streak Trigger
  const handleRepairStreak = (habitId, dateKey) => {
      setPendingRepair({ habitId, dateKey });
      setReflectionOpen(true);
  };

  // NEW: Confirm Repair
  const confirmRepair = async () => {
      const currentTokens = userProfile?.tokens !== undefined ? userProfile.tokens : 3; // Default to 3

      if (pendingRepair) {
          if (currentTokens > 0) {
              await handleToggleHabit(pendingRepair.habitId, pendingRepair.dateKey);
              
              const newTokens = currentTokens - 1;
              if (user.uid === 'local-user') {
                  updateLocalProfile({ tokens: newTokens });
              } else {
                  const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
                  await updateDoc(userDocRef, { tokens: newTokens });
              }
              
              setPendingRepair(null);
              setReflectionOpen(false);
          } else {
              alert("Not enough tokens!"); 
          }
      }
  };

  const handleUpdateField = async (habitId, field, value) => {
     if (!user) return;
     const updatedHabits = habits.map(h => 
       h.id === habitId ? { ...h, [field]: value } : h
     );
     setHabits(updatedHabits);

     if (user.uid === 'local-user') {
       saveToLocal(updatedHabits);
       return;
     }
     const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habitId);
     updateDoc(docRef, { [field]: value }).catch(e => console.error("Save failed", e));
  };

  const handleDeleteHabit = async (habitId) => {
    const updatedHabits = habits.filter(h => h.id !== habitId);
    setHabits(updatedHabits);

    if (user.uid === 'local-user') {
        saveToLocal(updatedHabits);
        updateUserStats(updatedHabits);
        return;
    }

    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habitId));
        updateUserStats(updatedHabits);
    } catch (e) {
        console.error("Delete failed", e);
        alert("Failed to delete. Check connection.");
    }
  };

  const handleJoinSquad = async (squadId) => {
      if (!user) return;
      if (user.uid === 'local-user') {
          updateLocalProfile({ squadId });
          return;
      }
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
      await setDoc(userDocRef, { squadId }, { merge: true });
  };

  const handleOnboardingComplete = async (archetypeId, defaultHabits) => {
      const arch = ARCHETYPES[archetypeId.toUpperCase()];
      if (user.uid === 'local-user') {
          updateLocalProfile({ 
              archetype: archetypeId, 
              manifesto: arch.manifesto,
              displayName: user.displayName,
              tokens: 3 // Local starter tokens
          });
          // Add default habits locally
          const newHabits = defaultHabits.map((h, i) => ({
              ...h,
              id: `local-def-${Date.now()}-${i}`,
              createdAt: new Date().toISOString(),
              history: {}
          }));
          saveToLocal(newHabits);
      } else {
          const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
          await setDoc(userDocRef, { 
              archetype: archetypeId,
              manifesto: arch.manifesto,
              displayName: user.displayName,
              tokens: 3 // Cloud starter tokens
          }, { merge: true });
          // Add default habits to firestore
          for (const h of defaultHabits) {
              await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), {
                  ...h,
                  createdAt: serverTimestamp(),
                  history: {}
              });
          }
      }
      setIsOnboarding(false);
      setTutorialMode(true); // Enable First Win mode
      // Add small delay to ensure DOM is painted before tour starts on mobile
      setTimeout(() => {
          setShowTour(true); 
      }, 500);
  };

  // NEW: Hardcore Mode Toggle
  const handleToggleHardcore = async () => {
      const newVal = !userProfile?.hardcoreMode;
      if (user.uid === 'local-user') {
          updateLocalProfile({ hardcoreMode: newVal });
      } else {
          const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
          await setDoc(userDocRef, { hardcoreMode: newVal }, { merge: true });
      }
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    setCurrentDate(newDate);
  };

  const totalXP = habits.reduce((total, habit) => total + Object.keys(habit.history || {}).length, 0);
  const rankInfo = getRankInfo(totalXP);

  // Check if firebase config is present
  const isConfigured = firebaseConfig.apiKey !== "PLACEHOLDER";

  if (!user) {
    return <LoginView onLogin={handleGoogleLogin} onLocalMode={handleLocalMode} error={authError} isConfigured={isConfigured} />;
  }

  // 4. Loading State Check for Mobile Robustness
  if (user && !userProfile && user.uid !== 'local-user') {
    return (
        <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center p-4 text-white">
            <div className="animate-spin text-lime-400 mb-4">
                <Loader2 size={48} />
            </div>
            <p className="text-zinc-500 font-mono text-sm tracking-widest animate-pulse">SYNCING PROFILE...</p>
        </div>
    )
  }

  return (
    <ErrorBoundary>
    <div className="min-h-[100dvh] bg-black text-zinc-100 font-sans flex flex-col selection:bg-lime-400 selection:text-black overflow-x-hidden">
      {isOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      {showFirstWin && <SystemOnlineOverlay />}
      <ReflectionModal 
        isOpen={reflectionOpen} 
        onClose={() => setReflectionOpen(false)} 
        onRecover={confirmRepair}
        tokens={userProfile?.tokens !== undefined ? userProfile.tokens : 3}
      />
      <UserGuide 
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
      <TokenToast visible={tokenToast} />
      
      {/* Interactive Tour Overlay */}
      <GameTutorial 
        isActive={showTour} 
        onComplete={() => setShowTour(false)}
      />
      
      <NewHabitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddHabit}
      />
      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        rankInfo={rankInfo}
        totalXP={totalXP}
        habits={habits}
      />

      {/* Navbar */}
      <nav className="bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800 p-4 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-3 z-50 relative group cursor-pointer" onClick={() => setView('main')}>
             <div className="w-10 h-10 bg-gradient-to-tr from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(163,230,53,0.3)] text-black transform group-hover:rotate-12 transition-transform duration-300">M</div>
             <div className="hidden sm:block">
                <h1 className="font-black text-xl leading-none tracking-tighter">TRACKER<span className="text-lime-400">.OS</span></h1>
                <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">Supreme Edition</p>
             </div>
          </div>

          <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-zinc-800 overflow-x-auto scrollbar-hide">
             <button 
                onClick={() => setView('main')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${view === 'main' ? 'bg-zinc-800 text-lime-400 shadow-sm' : 'text-zinc-500 hover:text-white'}`}
             >
                <Layout size={16} /> <span className="hidden md:inline">DASHBOARD</span>
             </button>
             <button 
                id="tour-nav-squad"
                onClick={() => setView('squad')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${view === 'squad' ? 'bg-zinc-800 text-lime-400 shadow-sm' : 'text-zinc-500 hover:text-white'}`}
             >
                <Users size={16} /> <span className="hidden md:inline">SQUAD</span>
             </button>
          </div>

          <div className="flex items-center gap-4">
             {(installPrompt || isIOS) && (
                 <button onClick={handleInstallApp} className="flex items-center gap-2 text-xs font-bold bg-lime-400 text-black px-3 py-1.5 rounded-lg hover:bg-lime-300">
                     <Download size={14}/> <span className="hidden sm:inline">Install App</span>
                 </button>
             )}

             <button 
                onClick={() => setShowGuide(true)}
                className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                title="User Manual"
             >
                <BookOpen size={20} />
             </button>

             <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800 hidden sm:flex">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-lime-400 transition-colors"><ChevronLeft size={16}/></button>
                <span className="px-3 text-sm font-bold min-w-[80px] text-center text-zinc-200">
                   {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase()}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-lime-400 transition-colors"><ChevronRight size={16}/></button>
             </div>
             
             <button 
                onClick={handleLogout}
                className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                title="Sign Out"
             >
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-2 md:p-6 print:p-0 print:max-w-none flex flex-col">
        {view === 'main' && (
          <div className="flex-1 animate-in fade-in zoom-in-95 duration-500 flex flex-col gap-8 pb-20">
             <section>
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        <Flame className="text-orange-500 fill-orange-500" size={20} />
                        <h2 className="text-xl font-black tracking-tight text-white">PERFORMANCE</h2>
                    </div>
                    {/* Visual Comeback Mode Indicator */}
                    <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                        <TrendingUp size={14} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-yellow-500 uppercase">Comeback Mode Active (2x XP)</span>
                    </div>
                </div>
                
                {/* New Achievements Section */}
                <AchievementsView habits={habits} totalXP={totalXP} />

                <AnalyticsView 
                    habits={habits} 
                    currentDate={currentDate} 
                    onOpenShare={() => setIsShareOpen(true)}
                    userProfile={userProfile}
                    onToggleHardcore={handleToggleHardcore}
                />
             </section>

             <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                   <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                   <h2 className="text-xl font-black tracking-tight text-white">ACTIVE PROTOCOLS</h2>
                </div>
                <TrackerView 
                  habits={habits}
                  currentDate={currentDate}
                  onToggle={handleToggleHabit}
                  onRepairStreak={handleRepairStreak}
                  onOpenNewHabit={() => setIsModalOpen(true)}
                  onDelete={handleDeleteHabit}
                  onUpdateField={handleUpdateField}
                  tutorialMode={tutorialMode}
                />
             </section>
          </div>
        )}

        {view === 'squad' && (
            <SquadView 
                user={user}
                userProfile={userProfile}
                onJoinSquad={handleJoinSquad}
            />
        )}
      </main>
      
      <style>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #18181b; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3f3f46; 
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a3e635; 
        }
      `}</style>
    </div>
    </ErrorBoundary>
  );
}
