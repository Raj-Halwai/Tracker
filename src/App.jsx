import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  BarChart2, 
  Grid, 
  Printer, 
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
  LogIn
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
  signOut
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
  serverTimestamp, 
  setDoc,
  getDoc
} from 'firebase/firestore';

// --- Firebase Initialization ---
// Helper to get config from Vite Env Vars (for Vercel) or Global (for Canvas)
const getFirebaseConfig = () => {
  // 1. Try Vite Environment Variables (Standard for Vercel/Local)
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
  } catch (e) {
    // Ignore error if import.meta is not available
  }

  // 2. Try Global Config (For Canvas Preview)
  if (typeof __firebase_config !== 'undefined') {
    return JSON.parse(__firebase_config);
  }

  // 3. Fallback / Placeholder
  return { apiKey: "PLACEHOLDER", projectId: "PLACEHOLDER" };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Use fixed app ID for global usage or env var for isolation
const appId = typeof __app_id !== 'undefined' ? __app_id : 'me-supreme-tracker';

// --- Utility Functions ---
const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getDateKey = (date, day) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// --- Components ---

// 0. Login Screen
const LoginView = ({ onLogin, onLocalMode, error }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-3xl shadow-lg transform rotate-3">
            M
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Tracker</h1>
        <p className="text-slate-400 text-center mb-8">Ultimate Habit Command Center</p>
        
        <div className="space-y-4">
          <button 
            onClick={onLogin}
            className="w-full bg-white text-slate-900 font-bold py-3 px-4 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-slate-500">Or continue offline</span>
            </div>
          </div>

          <button 
            onClick={onLocalMode}
            className="w-full bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl hover:bg-slate-600 transition-all flex items-center justify-center gap-3"
          >
            <Smartphone size={20} />
            Use Device Storage Only
          </button>
        </div>

        {error && (
          <div className="mt-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <p className="mt-6 text-xs text-center text-slate-500">
          Sync requires Google Sign-In. Local mode data stays on this device.
        </p>
      </div>
    </div>
  );
};

// 1. Digital Tracker (Spreadsheet View)
const TrackerView = ({ habits, currentDate, onToggle, onAdd, onDelete, onUpdateField }) => {
  const daysInMonth = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header / Controls */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Grid size={20} className="text-indigo-600" />
          Habit Grid
        </h2>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Spreadsheet Area */}
      <div className="flex-1 overflow-auto relative custom-scrollbar">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="p-3 text-left font-semibold text-slate-600 min-w-[150px] md:min-w-[200px] sticky left-0 bg-slate-50 z-30 border-r border-slate-200">
                Habit Name
              </th>
              <th className="p-2 text-center font-semibold text-slate-600 w-[50px] md:w-[60px] border-r border-slate-200 text-xs">
                Goal
              </th>
              {daysArray.map(day => (
                <th key={day} className={`p-1 min-w-[32px] md:min-w-[36px] text-center border-r border-slate-100 ${isToday(day) ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500'}`}>
                  <div className="text-[9px] md:text-[10px] uppercase opacity-70">{getDayLabel(day)}</div>
                  <div className="text-xs">{day}</div>
                </th>
              ))}
              <th className="p-2 min-w-[50px] md:min-w-[60px] text-center text-slate-600 font-semibold sticky right-0 bg-slate-50 z-20 border-l border-slate-200 text-xs">
                %
              </th>
              <th className="p-2 min-w-[30px] md:min-w-[40px] sticky right-0 bg-slate-50 z-20"></th>
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 4} className="p-12 text-center text-slate-400">
                  No habits yet. Click "New Habit" to start building your routine.
                </td>
              </tr>
            ) : (
              habits.map(habit => {
                const totalCompleted = daysArray.reduce((acc, day) => {
                  return acc + (habit.history?.[getDateKey(currentDate, day)] ? 1 : 0);
                }, 0);
                
                // Goal Calculation
                const goal = habit.goal || daysInMonth;
                const percent = Math.min(100, Math.round((totalCompleted / goal) * 100));
                const isGoalMet = totalCompleted >= goal;

                return (
                  <tr key={habit.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                    <td className="p-2 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200">
                      <input 
                        type="text" 
                        value={habit.name}
                        onChange={(e) => onUpdateField(habit.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-slate-700 font-medium placeholder-slate-300 text-sm"
                        placeholder="Enter habit..."
                      />
                    </td>
                    <td className="p-1 text-center border-r border-slate-200">
                       <input 
                        type="number" 
                        value={habit.goal || ''}
                        onChange={(e) => onUpdateField(habit.id, 'goal', parseInt(e.target.value) || 0)}
                        className="w-full text-center bg-transparent border-none focus:ring-0 text-slate-500 text-xs"
                        placeholder={daysInMonth}
                      />
                    </td>
                    {daysArray.map(day => {
                      const dateKey = getDateKey(currentDate, day);
                      const isDone = habit.history?.[dateKey];
                      return (
                        <td key={day} className={`p-0 text-center border-r border-slate-100 ${isToday(day) ? 'bg-indigo-50/30' : ''}`}>
                          <button
                            onClick={() => onToggle(habit.id, dateKey)}
                            className={`w-full h-9 md:h-10 flex items-center justify-center transition-all duration-200 hover:bg-indigo-100/50 ${isDone ? 'bg-indigo-500 text-white hover:!bg-indigo-600' : ''}`}
                          >
                            {isDone && <Check size={14} strokeWidth={4} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-bold text-xs border-l border-slate-200 bg-white group-hover:bg-slate-50 sticky right-0 z-10">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`${isGoalMet ? 'text-green-600' : 'text-indigo-600'}`}>
                          {percent}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-normal hidden md:inline">
                          {totalCompleted}/{goal}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-center bg-white group-hover:bg-slate-50 sticky right-0 z-10">
                      <button 
                        onClick={() => onDelete(habit.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
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

// 2. Analytics Dashboard
const AnalyticsView = ({ habits, currentDate }) => {
  const daysInMonth = getDaysInMonth(currentDate);
  // Fix for Recharts "width(-1)" warning: Wait for mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Small delay to ensure layout is computed
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // -- Chart 1: Daily Consistency (Line) --
  const lineData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateKey = getDateKey(currentDate, day);
    const count = habits.reduce((acc, h) => acc + (h.history?.[dateKey] ? 1 : 0), 0);
    return { day, count };
  });

  // -- Chart 2: Weekly Performance (Bar) --
  const weeklyData = [];
  for (let i = 0; i < 4; i++) {
    const startDay = i * 7 + 1;
    const endDay = Math.min((i + 1) * 7, daysInMonth);
    let weekTotal = 0;
    for (let d = startDay; d <= endDay; d++) {
       const dateKey = getDateKey(currentDate, d);
       weekTotal += habits.reduce((acc, h) => acc + (h.history?.[dateKey] ? 1 : 0), 0);
    }
    weeklyData.push({ week: `Week ${i+1}`, completed: weekTotal });
  }

  // -- Chart 3: Overall Completion (Pie) --
  const totalGoals = habits.reduce((acc, h) => acc + (h.goal || daysInMonth), 0);
  const totalCompletedActual = habits.reduce((acc, h) => {
    let habitCount = 0;
    for(let i=1; i<=daysInMonth; i++) {
       if (h.history?.[getDateKey(currentDate, i)]) habitCount++;
    }
    return acc + habitCount;
  }, 0);
  
  const completionRate = totalGoals > 0 ? Math.round((totalCompletedActual / totalGoals) * 100) : 0;
  const pieData = [
    { name: 'Completed', value: totalCompletedActual },
    { name: 'Remaining', value: Math.max(0, totalGoals - totalCompletedActual) }
  ];
  const PIE_COLORS = ['#4f46e5', '#e2e8f0'];

  // -- Top Habits --
  const sortedHabits = [...habits].sort((a, b) => {
    const getCount = (h) => {
      let c = 0;
      for(let i=1; i<=daysInMonth; i++) if (h.history?.[getDateKey(currentDate, i)]) c++;
      return c;
    };
    return getCount(b) - getCount(a);
  }).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 animate-fade-in pb-12">
      
      {/* 1. Overall Score (Donut) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center min-h-[300px] min-w-0">
        <h3 className="text-slate-500 font-semibold mb-2 uppercase text-xs tracking-wider">Goal Efficiency</h3>
        <div className="relative w-48 h-48">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-4xl font-black text-slate-800">{completionRate}%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status</span>
          </div>
        </div>
        <p className="text-center text-sm text-slate-400 mt-4 px-4">
          You have completed <strong>{totalCompletedActual}</strong> actions out of your <strong>{totalGoals}</strong> target goals this month.
        </p>
      </div>

      {/* 2. Consistency (Line) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 md:col-span-2 lg:col-span-4 min-h-[300px] min-w-0">
        <h3 className="text-slate-500 font-semibold mb-6 uppercase text-xs tracking-wider">Daily Consistency Flow</h3>
        <div className="h-56 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  cursor={{stroke: '#6366f1', strokeWidth: 2}}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2}} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Weekly Breakdown (Bar) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 md:col-span-1 lg:col-span-3 min-h-[300px] min-w-0">
        <h3 className="text-slate-500 font-semibold mb-6 uppercase text-xs tracking-wider">Weekly Volume</h3>
        <div className="h-56 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
                <Bar dataKey="completed" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Top Habits List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-1 md:col-span-1 lg:col-span-3 min-h-[300px] overflow-hidden min-w-0">
        <h3 className="text-slate-500 font-semibold mb-6 uppercase text-xs tracking-wider flex items-center gap-2">
           <Trophy className="text-yellow-500" size={16} /> Leaderboard
        </h3>
        <div className="space-y-3">
          {sortedHabits.map((h, i) => {
             let count = 0;
             for(let d=1; d<=daysInMonth; d++) if(h.history?.[getDateKey(currentDate, d)]) count++;
             const goal = h.goal || daysInMonth;
             const pct = Math.min(100, Math.round((count / goal) * 100));
             
             return (
               <div key={h.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                       <span className="font-medium text-slate-700 text-sm truncate pr-2">{h.name}</span>
                       <span className="text-xs font-bold text-indigo-600">{count}/{goal}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
               </div>
             );
          })}
          {sortedHabits.length === 0 && <p className="text-slate-400 text-sm italic">Add habits to see rankings.</p>}
        </div>
      </div>
    </div>
  );
};

// 3. Analog / Print View
const AnalogView = ({ habits, currentDate }) => {
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const daysInMonth = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="print-container bg-white text-black p-8 max-w-[1100px] mx-auto shadow-2xl print:shadow-none print:w-full print:max-w-none print:p-0">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-6">
        <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Tracker</h1>
            <p className="text-sm tracking-[0.2em] uppercase mt-1 font-bold">Analog Command Center</p>
        </div>
        <div className="text-right">
            <h2 className="text-6xl font-black text-slate-200 print:text-slate-300 uppercase leading-none">{monthName}</h2>
            <p className="text-2xl font-bold tracking-widest">{year}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Col: Habits */}
        <div className="col-span-8">
            <h3 className="text-xs font-black uppercase mb-2 border-b-2 border-black pb-1">Protocols & Habits</h3>
            <div className="border-2 border-black">
                {/* Header Row */}
                <div className="flex border-b-2 border-black text-[9px] font-bold h-6 items-center">
                    <div className="w-48 px-2 border-r border-black shrink-0">ROUTINE</div>
                    {daysArray.map(d => (
                        <div key={d} className={`flex-1 text-center border-r border-slate-300 last:border-r-0 h-full flex items-center justify-center ${d % 5 === 0 ? 'bg-slate-200 print:bg-slate-200' : ''}`}>
                            {d}
                        </div>
                    ))}
                </div>
                {/* Habit Rows */}
                {habits.slice(0, 20).map((h, i) => (
                    <div key={h.id || i} className="flex border-b border-slate-300 last:border-b-0 h-7 text-[10px]">
                        <div className="w-48 px-2 border-r border-black shrink-0 flex items-center font-bold truncate bg-slate-50 print:bg-slate-50">
                           {h.name}
                        </div>
                         {daysArray.map(d => (
                            <div key={d} className={`flex-1 border-r border-slate-200 last:border-r-0 ${d % 5 === 0 ? 'bg-slate-100 print:bg-slate-100' : ''}`}></div>
                        ))}
                    </div>
                ))}
                {/* Empty Filler Rows */}
                {Array.from({ length: Math.max(0, 20 - habits.length) }).map((_, i) => (
                     <div key={`empty-${i}`} className="flex border-b border-slate-300 last:border-b-0 h-7">
                        <div className="w-48 border-r border-black shrink-0"></div>
                        {daysArray.map(d => (
                            <div key={d} className={`flex-1 border-r border-slate-200 last:border-r-0 ${d % 5 === 0 ? 'bg-slate-100 print:bg-slate-100' : ''}`}></div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
                 <div>
                    <h3 className="text-xs font-black uppercase mb-2 border-b-2 border-black pb-1">Top 3 Monthly Goals</h3>
                    <div className="border-2 border-black h-36 p-4 flex flex-col justify-between">
                         <div className="border-b-2 border-dotted border-slate-400 h-8 flex items-end font-handwriting text-sm"><span className="font-bold mr-2">1.</span></div>
                         <div className="border-b-2 border-dotted border-slate-400 h-8 flex items-end font-handwriting text-sm"><span className="font-bold mr-2">2.</span></div>
                         <div className="border-b-2 border-dotted border-slate-400 h-8 flex items-end font-handwriting text-sm"><span className="font-bold mr-2">3.</span></div>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xs font-black uppercase mb-2 border-b-2 border-black pb-1">Achievements & Wins</h3>
                    <div className="border-2 border-black h-36 p-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] [background-size:100%_20px] pointer-events-none"></div>
                    </div>
                 </div>
            </div>
        </div>

        {/* Right Col: Quantified Self */}
        <div className="col-span-4 flex flex-col gap-6">
            
            {/* Screen Time */}
            <div>
                <h3 className="text-xs font-black uppercase mb-2 border-b-2 border-black pb-1">Digital Metrics / Screen Time</h3>
                <div className="border-2 border-black p-4 bg-slate-50 print:bg-slate-50">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white border-2 border-slate-800 h-16 rounded flex flex-col items-center justify-center">
                            <span className="text-[9px] uppercase font-black text-slate-400">Morning</span>
                            <div className="w-8 h-8 border border-slate-200 mt-1"></div>
                        </div>
                        <div className="bg-white border-2 border-slate-800 h-16 rounded flex flex-col items-center justify-center">
                            <span className="text-[9px] uppercase font-black text-slate-400">Day</span>
                            <div className="w-8 h-8 border border-slate-200 mt-1"></div>
                        </div>
                        <div className="bg-white border-2 border-slate-800 h-16 rounded flex flex-col items-center justify-center">
                             <span className="text-[9px] uppercase font-black text-slate-400">Eve</span>
                             <div className="w-8 h-8 border border-slate-200 mt-1"></div>
                        </div>
                        <div className="bg-white border-2 border-slate-800 h-16 rounded flex flex-col items-center justify-center">
                             <span className="text-[9px] uppercase font-black text-slate-400">Night</span>
                             <div className="w-8 h-8 border border-slate-200 mt-1"></div>
                        </div>
                    </div>
                    <div className="text-center text-[10px] font-bold uppercase mt-2 pt-2 border-t border-slate-300">Target: &lt; 2 Hrs Total</div>
                </div>
            </div>

            {/* Mood Graph */}
            <div className="flex-1">
                <h3 className="text-xs font-black uppercase mb-2 border-b-2 border-black pb-1">Mood / Energy Graph</h3>
                <div className="border-2 border-black h-64 relative bg-white">
                     {/* Grid lines for graph */}
                     <div className="absolute inset-0 flex flex-col justify-between p-0 pointer-events-none">
                         <div className="border-b border-slate-100 w-full h-full"></div>
                         <div className="border-b border-slate-100 w-full h-full"></div>
                         <div className="border-b border-slate-100 w-full h-full"></div>
                         <div className="border-b border-slate-100 w-full h-full"></div>
                     </div>
                     <div className="absolute inset-0 flex justify-between px-1 items-end pointer-events-none">
                         {daysArray.filter(d => d%2!==0).map(d => (
                             <div key={d} className="h-2 w-px bg-slate-400 mb-0"></div>
                         ))}
                     </div>
                     <span className="absolute top-1 left-2 text-[8px] font-black bg-white px-1">HIGH</span>
                     <span className="absolute bottom-1 left-2 text-[8px] font-black bg-white px-1">LOW</span>
                </div>
            </div>

            {/* Notes */}
            <div className="h-40">
                <h3 className="text-xs font-black uppercase mb-2 border-b-2 border-black pb-1">End of Month Review</h3>
                <div className="border-2 border-black h-full bg-[radial-gradient(#9ca3af_1px,transparent_1px)] [background-size:10px_10px]"></div>
            </div>
        </div>
      </div>
      
      <div className="mt-8 text-center border-t-2 border-black pt-2">
         <p className="text-xs font-black uppercase tracking-[0.3em]">"It's not over until I win."</p>
      </div>

    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('tracker'); 
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Auth Listener
  useEffect(() => {
    // Initial check for current config
    if (firebaseConfig.apiKey === "PLACEHOLDER") {
      setLoading(false); // Stop loading so we can show login screen with error if needed
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) setAuthError(null);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Sync
  useEffect(() => {
    if (!user) return;
    
    // --- LOCAL MODE HANDLER ---
    if (user.uid === 'local-user') {
        try {
            const localData = localStorage.getItem('me_supreme_habits');
            if (localData) {
                setHabits(JSON.parse(localData));
            }
        } catch (e) {
            console.error("Local storage load error", e);
        }
        return;
    }

    // --- FIRESTORE HANDLER ---
    try {
      const q = query(
        collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), 
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedHabits = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setHabits(loadedHabits);
      }, (err) => {
          console.error("Firestore Error:", err);
          // Don't block UI on error, just log
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore sync failed:", e);
    }
  }, [user]);

  // --- Helpers ---
  const saveToLocal = (updatedHabits) => {
      setHabits(updatedHabits);
      localStorage.setItem('me_supreme_habits', JSON.stringify(updatedHabits));
  };

  // --- Auth Handlers ---
  const handleGoogleLogin = async () => {
    if (firebaseConfig.apiKey === "PLACEHOLDER") {
      setAuthError("Database not configured. Please see deployment instructions.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      setAuthError(error.message);
    }
  };

  const handleLocalMode = () => {
    setUser({ uid: 'local-user', isAnonymous: true });
  };

  const handleLogout = async () => {
    if (user?.uid === 'local-user') {
      setUser(null);
    } else {
      await signOut(auth);
    }
    setHabits([]); // Clear data on logout
  };

  // --- Data Handlers ---
  const handleAddHabit = async () => {
    if (!user) return;
    const daysInMonth = getDaysInMonth(currentDate);
    const newHabit = {
      id: user.uid === 'local-user' ? `local-${Date.now()}` : null, 
      name: `New Habit ${habits.length + 1}`,
      goal: daysInMonth, 
      createdAt: new Date().toISOString(), 
      history: {}
    };

    if (user.uid === 'local-user') {
        saveToLocal([...habits, newHabit]);
        return;
    }

    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'habits'), {
        ...newHabit,
        createdAt: serverTimestamp() 
    });
  };

  const handleToggleHabit = async (habitId, dateKey) => {
    if (!user) return;
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    const habit = habits[habitIndex];
    const newHistory = { ...habit.history };
    if (newHistory[dateKey]) {
      delete newHistory[dateKey];
    } else {
      newHistory[dateKey] = true;
    }

    if (user.uid === 'local-user') {
        const updatedHabits = [...habits];
        updatedHabits[habitIndex] = { ...habit, history: newHistory };
        saveToLocal(updatedHabits);
        return;
    }

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habitId);
    await updateDoc(docRef, { history: newHistory });
  };

  const handleUpdateField = async (habitId, field, value) => {
     if (!user) return;

     if (user.uid === 'local-user') {
        const updatedHabits = habits.map(h => 
            h.id === habitId ? { ...h, [field]: value } : h
        );
        saveToLocal(updatedHabits);
        return;
     }

     const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habitId);
     await updateDoc(docRef, { [field]: value });
  };

  const handleDeleteHabit = async (habitId) => {
    if (!user || !confirm('Are you sure you want to delete this habit? History will be lost.')) return;
    
    if (user.uid === 'local-user') {
        const updatedHabits = habits.filter(h => h.id !== habitId);
        saveToLocal(updatedHabits);
        return;
    }

    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'habits', habitId));
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    setCurrentDate(newDate);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-slate-400 font-medium">
      <div className="animate-pulse flex flex-col items-center gap-4">
         <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl"></div>
         Loading Command Center...
      </div>
    </div>
  );

  // Show Login Screen if not authenticated
  if (!user) {
    return <LoginView onLogin={handleGoogleLogin} onLocalMode={handleLocalMode} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 z-50 relative">
             <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-black text-lg shadow-lg">M</div>
             <div className="hidden sm:block">
                <h1 className="font-bold text-lg leading-tight tracking-tight">Tracker</h1>
             </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
             {['tracker', 'dashboard', 'analog'].map((v) => (
                <button 
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  {v === 'tracker' && <Layout size={16} />}
                  {v === 'dashboard' && <BarChart2 size={16} />}
                  {v === 'analog' && <Printer size={16} />}
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
             ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-slate-800 rounded-lg p-1">
                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-700 rounded text-slate-300"><ChevronLeft size={16}/></button>
                <span className="px-3 text-sm font-medium min-w-[80px] text-center hidden sm:block">
                    {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                </span>
                <span className="px-2 text-sm font-medium sm:hidden">
                    {currentDate.toLocaleString('default', { month: 'short' })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-700 rounded text-slate-300"><ChevronRight size={16}/></button>
             </div>
             
             <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Sign Out"
             >
                <LogOut size={20} />
             </button>

             <button 
                className="md:hidden text-slate-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
                {mobileMenuOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
           <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-t border-slate-800 p-4 flex flex-col gap-2 shadow-xl animate-in slide-in-from-top-5">
              {['tracker', 'dashboard', 'analog'].map((v) => (
                <button 
                  key={v}
                  onClick={() => { setView(v); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${view === v ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  {v === 'tracker' && <Layout size={18} />}
                  {v === 'dashboard' && <BarChart2 size={18} />}
                  {v === 'analog' && <Printer size={18} />}
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
             ))}
           </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 md:p-6 print:p-0 print:max-w-none overflow-hidden flex flex-col">
        
        {view === 'tracker' && (
          <div className="flex-1 min-h-0 animate-in fade-in zoom-in-95 duration-300 flex flex-col">
             <TrackerView 
                habits={habits}
                currentDate={currentDate}
                onToggle={handleToggleHabit}
                onAdd={handleAddHabit}
                onDelete={handleDeleteHabit}
                onUpdateField={handleUpdateField}
             />
          </div>
        )}

        {view === 'dashboard' && (
          <div className="py-2 overflow-y-auto custom-scrollbar">
             <AnalyticsView habits={habits} currentDate={currentDate} />
          </div>
        )}

        {view === 'analog' && (
          <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-10">
             <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-6 py-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 w-full max-w-[1100px] print:hidden shadow-sm">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Printer size={24} className="text-indigo-600"/>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg">Print Mode Ready</h3>
                  <p className="text-sm text-indigo-700">
                    Optimized for A4/Letter. Hide headers and footers in your print settings for best results.
                  </p>
                </div>
                <button 
                  onClick={handlePrint}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                >
                  Print PDF
                </button>
             </div>
             <AnalogView habits={habits} currentDate={currentDate} />
          </div>
        )}

      </main>
      
      {/* Global Styles */}
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            .print-container, .print-container * {
                visibility: visible;
            }
            .print-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border: none;
            }
            nav, .no-print {
                display: none !important;
            }
        }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1; 
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; 
        }
      `}</style>
    </div>
  );
}