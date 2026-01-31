import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Play, LogOut, LayoutDashboard, History, Settings, PlusCircle, Trash2, DollarSign, Clock, AlertCircle, Trophy, Square } from 'lucide-react';
import { gameAPI } from './services/api';
import { toast, modal, askName } from './utils/alerts';
import Login from './pages/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Si pas de token, on affiche uniquement le Login
  if (!token) {
    return <Login setToken={(t) => {
      localStorage.setItem('token', t);
      setToken(t);
      navigate('/dashboard');
    }} />;
  }

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">B</div>
            <h1 className="text-xl font-black">BillardPro</h1>
          </div>
          <nav className="space-y-2">
            <MenuBtn label="Dashboard" icon={<LayoutDashboard size={20} className="text-indigo-400"/>} path="/dashboard" />
            <MenuBtn label="Historique" icon={<History size={20} className="text-amber-400"/>} path="/history" />
            <MenuBtn label="Paramètres" icon={<Settings size={20} className="text-slate-400"/>} path="/settings" />
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800">
          <button 
            onClick={() => { localStorage.clear(); window.location.href='/'; }} 
            className="flex items-center gap-3 text-rose-500 w-full p-3 hover:bg-rose-500/10 rounded-xl transition"
          >
            <LogOut size={20}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#020617]">
        <Routes>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

// --- VUE PARAMÈTRES (POUR CRÉER LES TABLES DANS LE FRONT) ---
function SettingsView() {
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState("");

  const loadTables = async () => {
    const res = await gameAPI.getTables();
    setTables(res.data);
  };

  useEffect(() => {
    const load = async () => {
      await loadTables();
    };
    load();
  }, []);

  const handleAddTable = async () => {
    if (!newTableName) {
      toast('Entrez un nom de table', 'warning');
      return;
    }
    // Get next available table number
    const tablesRes = await gameAPI.getTables();
    const existingTables = tablesRes.data;
    const maxNum = existingTables.reduce((max, t) => Math.max(max, t.numero || 0), 0);
    
    await gameAPI.createTable({ 
      nom: newTableName, 
      numero: maxNum + 1,
      prix_heure: 10 
    });
    setNewTableName("");
    loadTables();
    toast('Table créée avec succès!', 'success');
  };

  const handleDeleteTable = async (id) => {
    const result = await modal('Supprimer', 'Voulez-vous vraiment supprimer cette table?', 'warning');
    if (result.isConfirmed) {
      await gameAPI.deleteTable(id);
      loadTables();
      toast('Table supprimée', 'success');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-white">Paramètres de la Salle</h2>
      
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 mb-8">
        <h3 className="text-lg font-bold mb-4">Ajouter une nouvelle table</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Nom (ex: Billard C)"
            className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-xl outline-none focus:border-indigo-500"
          />
          <button 
            onClick={handleAddTable} 
            className="bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-500 flex items-center gap-2"
          >
            <PlusCircle size={20}/> Créer
          </button>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <h3 className="text-lg font-bold mb-4">Gestion des tables existantes</h3>
        <div className="space-y-4">
          {tables.map(t => (
            <div key={t.id} className="flex justify-between items-center p-4 bg-slate-800 rounded-2xl border border-slate-700">
              <span className="font-bold">{t.nom}</span>
              <button 
                onClick={() => handleDeleteTable(t.id)} 
                className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg"
              >
                <Trash2 size={20}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour le menu
function MenuBtn({ label, icon, path }) {
  const navigate = useNavigate();
  const isActive = window.location.pathname === path;
  return (
    <button 
      onClick={() => navigate(path)} 
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${isActive ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
    >
      {icon} {label}
    </button>
  );
}

// --- DASHBOARD VIEW ---
function DashboardView() {
  const [games, setGames] = useState([]);
  const [tables, setTables] = useState([]);
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
    } catch (error) {
      console.error("Erreur fetchData", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, []);

  const handleAddClient = async () => {
    const name = await askName('Nouveau Client');
    if (name) {
      try {
        await gameAPI.createClient({ nom: name, telephone: '' });
        toast('Client ajouté avec succès!', 'success');
        fetchData();
      } catch {
        modal('Erreur', "Impossible d'ajouter le client", 'error');
      }
    }
  };

  // Calculate unpaid by client
  const unpaidByClient = games.reduce((acc, game) => {
    if (!game.est_paye && game.client_info?.nom) {
      const name = game.client_info.nom;
      acc[name] = (acc[name] || 0) + parseFloat(game.prix || 0);
    }
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-slate-500 text-sm">Gestion des tables et revenus</p>
        </div>
        <button 
          onClick={handleAddClient} 
          className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500 transition"
        >
          <PlusCircle size={18}/> Nouveau Client
        </button>
      </header>

      {/* ADDITIONS EN ATTENTE */}
      {Object.keys(unpaidByClient).length > 0 && (
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-rose-500/30 mb-6">
          <h3 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
            <DollarSign size={18} className="text-rose-500"/> Additions en attente
          </h3>
          <div className="flex gap-3 overflow-x-auto">
            {Object.entries(unpaidByClient).map(([name, total]) => (
              <div key={name} className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 min-w-[120px]">
                <p className="text-xs text-rose-300">{name}</p>
                <p className="text-lg font-black text-rose-400">{total.toFixed(2)} DT</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-xs uppercase flex items-center gap-2"><DollarSign size={14}/> Recette Jour</p>
          <p className="text-2xl font-black text-emerald-400">{stats.today_revenue || 0} DT</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-xs uppercase flex items-center gap-2"><Clock size={14}/> Heure Pic</p>
          <p className="text-2xl font-black text-indigo-400">{stats.peak_hour || 0}:00</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-xs uppercase flex items-center gap-2"><AlertCircle size={14}/> Non Payés</p>
          <p className="text-2xl font-black text-rose-400">{stats.unpaid_count || 0}</p>
        </div>
        <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-xs uppercase flex items-center gap-2"><Trophy size={14}/> Total Parties</p>
          <p className="text-2xl font-black text-amber-400">{stats.total_games || 0}</p>
        </div>
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-2 gap-8">
        {tables.map(table => (
          <TableCard 
            key={table.id} 
            table={table} 
            onGameStarted={fetchData}
          />
        ))}
      </div>
    </div>
  );
}

// --- TABLE CARD ---
function TableCard({ table, onGameStarted }) {
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await gameAPI.createGame(table.id, '');
      toast('Partie lancée!', 'success');
      onGameStarted();
    } catch (error) {
      modal('Erreur', error.response?.data?.error || "Impossible de lancer la partie", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    const loserName = await askName('Fin de partie');
    if (loserName) {
      setLoading(true);
      try {
        const gamesRes = await gameAPI.getGames();
        const activeGame = gamesRes.data.find(g => g.table === table.id && g.est_en_cours);
        if (activeGame) {
          await gameAPI.stopGame(activeGame.id, loserName);
          toast('Partie enregistrée!', 'success');
          onGameStarted();
        }
      } catch (error) {
        modal('Erreur', error.response?.data?.error || "Erreur lors de l'arrêt", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const isActive = table.est_disponible === false;

  return (
    <div className={`bg-[#0f172a] p-6 rounded-2xl border border-slate-800 ${isActive ? 'border-indigo-500/50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-xs font-bold uppercase ${isActive ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isActive ? 'EN COURS' : 'LIBRE'}
          </span>
          <h3 className="text-2xl font-black text-white">{table.nom || `Table ${table.numero}`}</h3>
        </div>
        <div className={`text-4xl font-black ${isActive ? 'text-rose-500/20' : 'text-slate-800'}`}>
          {table.numero}
        </div>
      </div>

      {isActive && (
        <div className="bg-rose-500/10 p-3 rounded-xl mb-4">
          <p className="text-rose-400 text-sm font-bold">Session en cours...</p>
        </div>
      )}

      <div className="flex gap-3">
        {!isActive ? (
          <button 
            onClick={handleStart}
            disabled={loading}
            className="flex-1 bg-white text-slate-950 py-3 rounded-xl font-bold hover:bg-indigo-500 hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play size={18} className="text-current"/> START
          </button>
        ) : (
          <button 
            onClick={handleStop}
            disabled={loading}
            className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Square size={18} className="text-current"/> STOP
          </button>
        )}
      </div>
    </div>
  );
}

// --- HISTORY VIEW ---
function HistoryView() {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const loadGames = async () => {
      const res = await gameAPI.getGames();
      setGames(res.data);
    };
    loadGames();
  }, []);

  const filteredData = games.filter(game => 
    game.client_info?.nom?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h2 className="text-3xl font-bold">Historique</h2>
        <p className="text-slate-500 text-sm">Toutes les parties enregistrées</p>
      </header>

      <div className="bg-[#0f172a] rounded-3xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Liste des parties</h3>
          <input 
            type="text" 
            placeholder="Rechercher un client..." 
            className="bg-slate-900 border border-slate-700 p-2 rounded-lg text-sm w-64 outline-none focus:border-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <table className="w-full text-left">
          <thead className="text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Client</th>
              <th className="p-3">Table</th>
              <th className="p-3">Durée</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(game => (
              <tr key={game.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                <td className="p-3 text-slate-400 text-sm">
                  {new Date(game.date_debut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-3 font-bold">{game.client_info?.nom || '---'}</td>
                <td className="p-3"><span className="bg-slate-800 px-2 py-1 rounded text-xs">Table {game.table_numero}</span></td>
                <td className="p-3 text-slate-400">{game.duree || '---'}</td>
                <td className="p-3 text-emerald-400 font-bold">{game.prix} DT</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${game.est_paye ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500 animate-pulse'}`}>
                    {game.est_paye ? 'PAYÉ' : 'À PAYER'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">Aucune partie trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
