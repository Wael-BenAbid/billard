import React, { useState, useEffect } from 'react';
import { Play, Square, TrendingUp, Users, AlertCircle, Search, CheckCircle, Clock, LayoutDashboard, History, LogOut, Filter, BarChart3, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { gameAPI } from './services/api';

// Données de test pour le graphique
const dataStats = [
  { name: '18h', argent: 40 }, { name: '19h', argent: 120 },
  { name: '20h', argent: 300 }, { name: '21h', argent: 450 },
  { name: '22h', argent: 200 }, { name: '23h', argent: 150 },
];

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [tables, setTables] = useState([]);
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({ today_revenue: 0, peak_hour: 0, unpaid_count: 0, total_games: 0 });

  const fetchData = async () => {
    try {
      const [tablesRes, gamesRes, statsRes] = await Promise.all([
        gameAPI.getTables(),
        gameAPI.getGames(),
        gameAPI.getStats()
      ]);
      setTables(tablesRes.data);
      setGames(gamesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Erreur fetchData", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate unpaid debts by client
  const unpaidByClient = games.reduce((acc, game) => {
    if (!game.est_paye && game.client_info?.nom) {
      const name = game.client_info.nom;
      acc[name] = (acc[name] || 0) + parseFloat(game.prix || 0);
    }
    return acc;
  }, {});

  // Filter games by search term
  const filteredGames = games.filter(g => 
    g.client_info?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans">
      
      {/* SIDEBAR */}
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

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10 relative">
        {activePage === 'dashboard' ? (
          <DashboardView 
            stats={stats}
            tables={tables}
            unpaidByClient={unpaidByClient}
            onGameStarted={fetchData}
          />
        ) : (
          <HistoryView 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredGames={filteredGames}
            dataStats={dataStats}
          />
        )}
      </main>
    </div>
  );
}

// --- VUE DASHBOARD ---
function DashboardView({ stats, tables, unpaidByClient, onGameStarted }) {
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-white mb-2">Dashboard</h2>
        <p className="text-slate-500">Contrôle des tables et revenus directs</p>
      </header>

      {/* ADDITIONS EN ATTENTE */}
      {Object.keys(unpaidByClient).length > 0 && (
        <div className="bg-[#0f172a] p-6 rounded-2xl mb-6 border border-rose-500/30">
          <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
             <AlertCircle size={18}/> Additions en attente
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Object.entries(unpaidByClient).map(([name, total]) => (
              <div key={name} className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 min-w-[150px]">
                <p className="text-xs font-bold text-rose-300 uppercase">{name}</p>
                <p className="text-xl font-black text-rose-400">{total.toFixed(2)} DT</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatBox title="Recette Jour" value={`${stats.today_revenue || 0} DT`} icon={<TrendingUp className="text-emerald-400"/>} color="emerald" />
        <StatBox title="Heure Pic" value={`${stats.peak_hour || 0}:00`} icon={<Clock className="text-indigo-400"/>} color="indigo" />
        <StatBox title="Non Payés" value={`${stats.unpaid_count || 0}`} icon={<AlertCircle className="text-rose-400"/>} color="rose" />
        <StatBox title="Parties Totales" value={stats.total_games || 0} icon={<Users className="text-amber-400"/>} color="amber" />
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {tables.map((table) => (
          <TableCard 
            key={table.id}
            table={table}
            onGameStarted={onGameStarted}
          />
        ))}
      </div>
    </div>
  );
}

// --- VUE HISTORIQUE ---
function HistoryView({ searchTerm, setSearchTerm, filteredGames, dataStats }) {
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
        </div>
      </header>

      {/* GRAPHIQUE */}
      <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-slate-800 mb-10 shadow-xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BarChart3 className="text-indigo-400"/> Courbe d'activité</h3>
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

      {/* TABLEAU */}
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
            {filteredGames.map(g => (
              <HistoryRow 
                key={g.id}
                date={new Date(g.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                client={g.client_info?.nom || "---"}
                table={g.table_numero || "A"}
                time={g.duree || "---"}
                price={g.prix || 0}
                status={g.est_paye ? "PAYÉ" : "À PAYER"}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- COMPOSANTS ---

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

function TableCard({ table, onGameStarted }) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await gameAPI.createGame({ table: table.id });
      onGameStarted();
    } catch (err) {
      console.error("Erreur start", err);
      alert(err.response?.data?.error || "Erreur lors du démarrage");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    const loserName = prompt("La partie est finie ! Quel est le nom du perdant ?");
    if (loserName) {
      setLoading(true);
      try {
        // Stop the first active game for this table
        const gamesRes = await gameAPI.getGames();
        const activeGame = gamesRes.data.find(g => g.table === table.id && g.est_en_cours);
        
        if (activeGame) {
          await gameAPI.stopGame(activeGame.id, { loser_name: loserName });
          onGameStarted();
        }
      } catch (err) {
        console.error("Erreur stop", err);
        alert(err.response?.data?.error || "Erreur lors de l'arrêt");
      } finally {
        setLoading(false);
      }
    }
  };

  const isActive = table.est_disponible === false;

  return (
    <div className={`bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 relative group overflow-hidden shadow-2xl transition-all ${isActive ? 'border-indigo-500/50' : ''}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${isActive ? 'indigo' : 'slate'}-500/10 blur-[80px] rounded-full`}></div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 block ${isActive ? 'text-rose-400' : 'text-indigo-400'}`}>
            {isActive ? 'EN COURS' : 'LIBRE'}
          </span>
          <h3 className="text-4xl font-black text-white italic">{table.nom || `BILLARD ${table.numero}`}</h3>
        </div>
        <div className={`text-6xl font-black ${isActive ? 'text-rose-500/20' : 'text-slate-800/50'} transition-colors`}>
          {table.numero}
        </div>
      </div>
      
      {isActive && (
        <div className="mb-6 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 relative z-10">
          <p className="text-rose-400 text-sm font-bold">Session en cours...</p>
          <p className="text-slate-400 text-xs mt-1">Cliquez sur STOP quand la partie finit</p>
        </div>
      )}

      <div className="relative z-10 flex gap-4">
        {!isActive ? (
          <button 
            onClick={handleStart}
            disabled={loading}
            className="flex-1 bg-white text-slate-950 hover:bg-indigo-500 hover:text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Play size={18} fill="currentColor"/> {loading ? '...' : 'START'}
          </button>
        ) : (
          <button 
            onClick={handleStop}
            disabled={loading}
            className="flex-1 bg-rose-500 text-white hover:bg-rose-600 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Square size={18} fill="currentColor"/> {loading ? '...' : 'STOP'}
          </button>
        )}
      </div>
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
