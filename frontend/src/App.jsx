import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, Users, AlertCircle, Search, CheckCircle, Clock, LayoutDashboard, History, LogOut, Filter, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { gameAPI } from './services/api';

// Données de test pour le graphique (à remplacer par ton API plus tard)
const dataStats = [
  { name: '18h', argent: 40 }, { name: '19h', argent: 120 },
  { name: '20h', argent: 300 }, { name: '21h', argent: 450 },
  { name: '22h', argent: 200 }, { name: '23h', argent: 150 },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans">
      
      {/* SIDEBAR - Fixée à gauche, ne cache plus rien */}
      <aside className="w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col sticky top-0 h-screen z-50 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">B</div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">BillardPro</h1>
          </div>

          <nav className="space-y-2">
            <MenuBtn icon={<LayoutDashboard/>} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
            <MenuBtn icon={<History/>} label="Historique & Stats" active={activePage === 'history'} onClick={() => setActivePage('history')} />
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-slate-700"></div>
            <div>
              <p className="text-sm font-bold">Wael Admin</p>
              <p className="text-[10px] text-slate-500 uppercase font-black">Propriétaire</p>
            </div>
          </div>
          <button className="flex items-center gap-3 text-rose-400 font-bold px-4 py-3 hover:bg-rose-500/10 rounded-2xl w-full transition border border-transparent hover:border-rose-500/20">
            <LogOut size={18}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-10 relative">
        {activePage === 'dashboard' ? (
          <DashboardView />
        ) : (
          <HistoryView searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        )}
      </main>
    </div>
  );
}

// --- VUE DASHBOARD ---
function DashboardView() {
  const [stats, setStats] = useState({ today_revenue: 0, peak_hour: 0, unpaid_count: 0, total_games: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await gameAPI.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Erreur stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white mb-2">Dashboard</h2>
        <p className="text-slate-500">Contrôle des tables et revenus directs</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatBox title="Recette Jour" value={`${stats.today_revenue || 0} DT`} icon={<TrendingUp className="text-emerald-400"/>} color="emerald" />
        <StatBox title="Heure Pic" value={`${stats.peak_hour || 0}:00`} icon={<Clock className="text-indigo-400"/>} color="indigo" />
        <StatBox title="Dettes Actuelles" value={`${stats.unpaid_count || 0} DT`} icon={<AlertCircle className="text-rose-400"/>} color="rose" />
        <StatBox title="Parties Totales" value={stats.total_games || 0} icon={<Users className="text-amber-400"/>} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <TableCard name="BILLARD A" num="1" color="indigo" />
        <TableCard name="BILLARD B" num="2" color="purple" />
      </div>
    </div>
  );
}

// --- VUE HISTORIQUE AVEC COURBE ---
function HistoryView({ searchTerm, setSearchTerm }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await gameAPI.getGames();
        setGames(res.data);
      } catch (err) {
        console.error("Erreur games", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Filter games by search term
  const filteredGames = games.filter(g => 
    g.client_info?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white mb-2">Historique & Analyses</h2>
          <p className="text-slate-500">Visualisez vos performances et gérez les dettes</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-800 border border-slate-700 rounded-2xl flex items-center px-4 py-2 gap-3">
             <Search size={18} className="text-slate-500"/>
             <input 
              type="text" 
              placeholder="Chercher un client..." 
              className="bg-transparent outline-none text-sm w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="bg-slate-800 border border-slate-700 p-3 rounded-2xl hover:bg-slate-700"><Filter size={20}/></button>
        </div>
      </header>

      {/* GRAPHIQUE DES REVENUS */}
      <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-slate-800 mb-10 shadow-xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-400"/> Courbe d'activité (Argent / Heure)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataStats}>
              <defs>
                <linearGradient id="colorArgent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
              <Area type="monotone" dataKey="argent" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorArgent)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLEAU HISTORIQUE */}
      <div className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <th className="px-8 py-5">Date & Heure</th>
              <th className="px-8 py-5">Client</th>
              <th className="px-8 py-5">Table</th>
              <th className="px-8 py-5">Durée</th>
              <th className="px-8 py-5">Prix</th>
              <th className="px-8 py-5 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan="6" className="px-8 py-10 text-center text-slate-500">Chargement...</td></tr>
            ) : filteredGames.length > 0 ? filteredGames.map(g => (
              <HistoryRow 
                key={g.id}
                date={new Date(g.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                client={g.client_info?.nom || "---"}
                table={g.table_numero || "A"}
                time={g.duree || "---"}
                price={g.prix || 0}
                status={g.est_paye ? "PAYÉ" : "À PAYER"}
              />
            )) : (
              <tr><td colSpan="6" className="px-8 py-10 text-center text-slate-500">Aucune partie trouvée</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- PETITS COMPOSANTS ---

function MenuBtn({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function StatBox({ title, value, icon, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  };
  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} bg-[#0f172a] shadow-sm`}>
      <div className="flex justify-between items-center mb-4">
        <div className="p-3 bg-slate-900 rounded-xl">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</span>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function TableCard({ name, num, color }) {
  const [clientName, setClientName] = useState('');
  const [nextPlayer, setNextPlayer] = useState('');
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    if (!clientName) {
      alert('Veuillez entrer un nom de client');
      return;
    }
    
    setLoading(true);
    try {
      // Create client if doesn't exist
      const clientRes = await gameAPI.createClient({
        nom: clientName,
        telephone: '',
      });
      
      // Start game
      await gameAPI.createGame({
        table: parseInt(num),
        client: clientRes.data.id,
        next_player: nextPlayer,
      });
      
      setClientName('');
      setNextPlayer('');
      alert('Partie démarrée avec succès!');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Erreur lors du démarrage de la partie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 relative group overflow-hidden shadow-2xl">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-[80px] rounded-full`}></div>
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Session Libre</span>
          <h3 className="text-4xl font-black text-white italic">{name}</h3>
        </div>
        <div className="text-6xl font-black text-slate-800/50 group-hover:text-indigo-500/20 transition-colors">{num}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mb-10 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Client</label>
          <input 
            type="text" 
            placeholder="Nom..." 
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl outline-none focus:border-indigo-500 transition" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Suivant</label>
          <input 
            type="text" 
            placeholder="Nom..." 
            value={nextPlayer}
            onChange={(e) => setNextPlayer(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl outline-none focus:border-indigo-500 transition" 
          />
        </div>
      </div>

      <button 
        onClick={startGame}
        disabled={loading}
        className="w-full bg-white text-slate-950 hover:bg-indigo-500 hover:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <Play size={18} fill="currentColor"/> {loading ? 'DÉMARRAGE...' : 'Démarrer la session'}
      </button>
    </div>
  );
}

function HistoryRow({ date, client, table, time, price, status }) {
  const isPaid = status === "PAYÉ";
  return (
    <tr className="hover:bg-slate-800/40 transition group">
      <td className="px-8 py-6 text-slate-500 font-mono text-xs">{date}</td>
      <td className="px-8 py-6 font-bold text-white">{client}</td>
      <td className="px-8 py-6"><span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-[10px] font-black text-indigo-400 uppercase">{table}</span></td>
      <td className="px-8 py-6 text-slate-400 font-medium">{time}</td>
      <td className="px-8 py-6 font-black text-xl text-emerald-400">{price} <span className="text-[10px] text-slate-500">DT</span></td>
      <td className="px-8 py-6 text-right">
        <span className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest ${isPaid ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse'}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

export default App;
