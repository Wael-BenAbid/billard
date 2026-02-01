import React, { useState, useEffect } from 'react';
import { Play, Square, LayoutDashboard, History, Settings, LogOut, Users, Plus, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { gameAPI, configAPI } from './services/api';

// Couleurs par table
const tableStyles = {
  1: { border: 'border-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-500/10', shadow: 'shadow-indigo-500/20', color: 'indigo' },
  2: { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/10', shadow: 'shadow-orange-500/20', color: 'orange' },
  3: { border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/10', shadow: 'shadow-purple-500/20', color: 'purple' },
  4: { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', shadow: 'shadow-emerald-500/20', color: 'emerald' },
};

// --- NAV BUTTON ---
function NavBtn({ label, active, onClick, icon }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all text-sm font-bold ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [tables, setTables] = useState([]);
  const [games, setGames] = useState([]);
  const [waitingList, setWaitingList] = useState([]);

  const refreshData = async () => {
    try {
      const t = await gameAPI.getTables();
      const g = await gameAPI.getGames();
      setTables(t.data);
      setGames(g.data);
    } catch (error) {
      console.error("Erreur refreshData", error);
    }
  };

  useEffect(() => { 
    const load = async () => { await refreshData(); };
    load();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const addToWaiting = (name) => {
    if (name && !waitingList.some(p => p.name === name)) {
      setWaitingList([...waitingList, { id: Date.now(), name }]);
    }
  };

  const removeFromWaiting = (id) => {
    setWaitingList(waitingList.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col">
      
      {/* NAVBAR EN HAUT */}
      <nav className="h-20 bg-[#0f172a] border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">B</div>
            <h1 className="text-xl font-black tracking-tighter uppercase">BillardPro</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1 border border-slate-800">
            <NavBtn label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} icon={<LayoutDashboard size={18}/>} />
            <NavBtn label="Historique" active={activePage === 'history'} onClick={() => setActivePage('history')} icon={<History size={18}/>} />
            <NavBtn label="Paramètres" active={activePage === 'settings'} onClick={() => setActivePage('settings')} icon={<Settings size={18}/>} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* FILE D'ATTENTE DANS LA NAVBAR */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-xl">
             <Users size={16} className="text-indigo-400"/>
             <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mr-2">Attente:</span>
             <div className="flex -space-x-2">
                {waitingList.map((p) => (
                  <div key={p.id} className="relative group">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-[#0f172a] flex items-center justify-center text-[10px] font-black uppercase cursor-default" title={p.name}>
                      {p.name.charAt(0)}
                    </div>
                    <button 
                      onClick={() => removeFromWaiting(p.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} className="text-white"/>
                    </button>
                  </div>
                ))}
                <button 
                  onClick={async () => {
                    const { value: name } = await Swal.fire({
                      title: 'Ajouter joueur',
                      input: 'text',
                      inputLabel: 'Nom du joueur',
                      background: '#0f172a',
                      color: '#fff',
                      confirmButtonColor: '#4f46e5',
                      showCancelButton: true,
                      inputValidator: (v) => v ? null : 'Required'
                    });
                    if (name) addToWaiting(name);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition"
                >
                  +
                </button>
             </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 text-rose-500 font-bold hover:bg-rose-500/10 px-4 py-2 rounded-xl transition">
            <LogOut size={18}/> <span className="text-sm">Sortir</span>
          </button>
        </div>
      </nav>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-6 overflow-x-auto">
        {activePage === 'dashboard' ? (
          <DashboardView tables={tables} games={games} refresh={refreshData} />
        ) : activePage === 'history' ? (
          <HistoryView games={games} />
        ) : (
          <SettingsView tables={tables} refresh={refreshData} />
        )}
      </main>
    </div>
  );
}

// --- LIVE TIMER ---
function LiveTimer({ startTime }) {
  const [elapsed, setElapsed] = useState("0h 00m 00s");

  useEffect(() => {
    let interval;
    const updateTimer = () => {
      const start = new Date(startTime);
      const now = new Date();
      const diff = Math.floor((now - start) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };
    
    updateTimer();
    interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono">{elapsed}</span>;
}

// --- TABLE CONTROL ---
function TableControl({ table, activeGame, style, onStart, onStop }) {
  return (
    <div className={`p-8 rounded-[2.5rem] border-2 bg-slate-900/60 shadow-2xl relative group overflow-hidden ${style.border}`}>
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h3 className={`text-3xl font-black italic uppercase tracking-tighter ${style.text}`}>{table.nom}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">
            {activeGame ? `En cours: ${activeGame.next_player || 'Joueur'}` : 'Libre pour une nouvelle partie'}
          </p>
        </div>
        {activeGame ? (
          <button 
            onClick={() => onStop(activeGame.id)}
            className={`p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg group-hover:scale-105 bg-rose-600 text-white shadow-rose-600/20`}
          >
            <Square size={24} fill="currentColor"/>
            <span className="font-black text-sm uppercase tracking-widest">Stop</span>
          </button>
        ) : (
          <button 
            onClick={() => onStart(table.id)}
            className={`p-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg group-hover:scale-105 ${style.text.replace('text-', 'bg-').replace('400', '600')} text-white shadow-${style.color}-600/20`}
          >
            <Play size={24} fill="currentColor"/>
            <span className="font-black text-sm uppercase tracking-widest">Start Game</span>
          </button>
        )}
      </div>
      
      {activeGame && (
        <div className="mt-6 text-center relative z-10">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Durée</p>
          <LiveTimer startTime={activeGame.date_debut} />
        </div>
      )}
      
      {/* Background Decor */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full ${style.text.replace('text-', 'bg-').replace('400', '500/10')}`}></div>
    </div>
  );
}

// --- DASHBOARD VIEW ---
function DashboardView({ tables, games, refresh }) {
  const handleStart = async (tableId) => {
    try {
      await gameAPI.createGame(tableId, '');
      Swal.fire({
        title: 'Lancé !',
        text: 'La partie a commencé',
        icon: 'success',
        background: '#0f172a',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
      refresh();
    } catch (err) {
      Swal.fire({
        title: 'Erreur',
        text: err.response?.data?.error || 'Impossible de lancer la partie',
        icon: 'error',
        background: '#0f172a',
        color: '#fff'
      });
    }
  };

  const handleStop = async (gameId) => {
    let clients = [];
    try {
      const res = await gameAPI.getClients();
      clients = res.data;
    } catch (e) {
      console.error("Erreur lors de la récupération des clients", e);
    }

    const optionsHtml = clients.map(c => `<option value="${c.nom}">`).join('');

    const { value: loserName } = await Swal.fire({
      title: 'Fin de partie',
      html: `
        <p class="text-slate-400 mb-2">Nom du perdant :</p>
        <input id="swal-input-name" list="client-suggestions" class="swal2-input" placeholder="Chercher ou ajouter...">
        <datalist id="client-suggestions">
          ${optionsHtml}
        </datalist>
      `,
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#4f46e5',
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        return document.getElementById('swal-input-name').value;
      }
    });

    if (loserName) {
      try {
        await gameAPI.stopGame(gameId, loserName);
        Swal.fire({
          title: 'Enregistré !',
          text: 'La partie a été enregistrée',
          icon: 'success',
          background: '#0f172a',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        });
        refresh();
      } catch (err) {
        Swal.fire({
          title: 'Erreur',
          text: err.response?.data?.error || 'Impossible d\'arrêter la partie',
          icon: 'error',
          background: '#0f172a',
          color: '#fff'
        });
      }
    }
  };

  const handleTogglePayment = async (gameId, currentStatus) => {
    try {
      await gameAPI.togglePayment(gameId, currentStatus);
      refresh();
    } catch (err) {
      console.error("Erreur de paiement", err);
    }
  };

  const calculateDuration = (start, end) => {
    const diff = Math.floor((new Date(end) - new Date(start)) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h}h ${m}min ${s}s`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
      {tables.map(table => {
        const style = tableStyles[table.id] || tableStyles[1];
        const activeGame = games.find(g => g.table === table.id && !g.date_fin);
        
        const tableHistory = games
          .filter(g => g.table === table.id && g.date_fin)
          .sort((a, b) => new Date(b.date_fin) - new Date(a.date_fin))
          .slice(0, 5);

        return (
          <div key={table.id} className="flex flex-col h-full">
            {/* COMPTEUR */}
            <TableControl 
              table={table} 
              activeGame={activeGame} 
              style={style} 
              onStart={handleStart} 
              onStop={handleStop} 
            />

            {/* TABLEAU DE CALCUL */}
            <div className={`mt-4 flex-1 bg-slate-900/40 rounded-[2.5rem] border-2 overflow-hidden shadow-xl ${style.border.replace('500', '500/50')}`}>
              <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
                <h4 className={`text-xs font-black uppercase tracking-[0.2em] ${style.text}`}>
                  Dernières activités - {table.nom}
                </h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aujourd'hui</span>
              </div>
              
              <div className="overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 uppercase text-[9px] tracking-widest border-b border-slate-800 bg-slate-900/20">
                    <tr>
                      <th className="px-6 py-4">Joueur</th>
                      <th className="px-6 py-4">Durée</th>
                      <th className="px-6 py-4 text-center">Payé</th>
                      <th className="px-6 py-4 text-right">Prix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tableHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-600 italic">Aucune partie</td>
                      </tr>
                    ) : (
                      tableHistory.map(g => (
                        <tr key={g.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-6 py-4 font-bold text-white uppercase">{g.client_nom || '---'}</td>
                          <td className="px-6 py-4 text-slate-400">{calculateDuration(g.date_debut, g.date_fin)}</td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleTogglePayment(g.id, g.est_paye)}
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                                g.est_paye 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                              }`}
                            >
                              {g.est_paye ? 'Oui' : 'Non'}
                            </button>
                          </td>
                          <td className={`px-6 py-4 text-right font-black text-xl ${style.text}`}>
                            {g.prix} <span className="text-[10px] text-slate-500">DT</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- HISTORY VIEW ---
function HistoryView({ games }) {
  const [filter, setFilter] = useState("");

  const filteredData = games.filter(g => 
    (g.client_nom || '').toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut));

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-black">Historique</h2>
        <p className="text-slate-500">Toutes les parties enregistrées</p>
      </header>

      <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Liste des parties</h3>
          <input 
            type="text" 
            placeholder="Rechercher un client..." 
            className="bg-slate-800 border border-slate-700 p-3 rounded-2xl text-sm w-64 outline-none focus:border-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <table className="w-full text-left">
          <thead className="text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Table</th>
              <th className="p-3">Client</th>
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
                <td className="p-3 font-bold">{game.table_nom}</td>
                <td className="p-3 font-bold">{game.client_nom || '---'}</td>
                <td className="p-3 text-emerald-400 font-bold">{game.prix} DT</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${game.est_paye ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500 animate-pulse'}`}>
                    {game.est_paye ? 'PAYÉ' : 'À PAYER'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Aucune partie trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- SETTINGS VIEW ---
function SettingsView({ tables, refresh }) {
  const [config, setConfig] = useState({
    nom_salle: "",
    tarif_base: 0,
    tarif_reduit: 0,
    seuil_prix: 0,
    devise: "DT"
  });
  const [newTableName, setNewTableName] = useState("");

  const loadConfig = async () => {
    try {
      const res = await configAPI.get();
      setConfig(res.data);
    } catch (error) {
      console.error("Erreur loadConfig", error);
    }
  };

  useEffect(() => {
    const load = async () => { await loadConfig(); };
    load();
  }, []);

  const handleSaveConfig = async () => {
    try {
      await configAPI.update(config);
      Swal.fire({
        title: 'Succès',
        text: 'Réglages enregistrés',
        icon: 'success',
        background: '#0f172a',
        color: '#fff'
      });
    } catch {
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible d\'enregistrer les réglages',
        icon: 'error',
        background: '#0f172a',
        color: '#fff'
      });
    }
  };

  const handleAddTable = async () => {
    if (!newTableName) return;
    try {
      const tablesRes = await gameAPI.getTables();
      const existingTables = tablesRes.data;
      const maxNum = existingTables.reduce((max, t) => Math.max(max, t.numero || 0), 0);
      
      await gameAPI.createTable({ 
        nom: newTableName, 
        numero: maxNum + 1,
        prix_heure: 10
      });
      setNewTableName("");
      refresh();
      Swal.fire({
        title: 'Succès',
        text: 'Table créée',
        icon: 'success',
        background: '#0f172a',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de créer la table',
        icon: 'error',
        background: '#0f172a',
        color: '#fff'
      });
    }
  };

  const handleDeleteTable = async (id) => {
    const result = await Swal.fire({
      title: 'Supprimer',
      text: 'Voulez-vous vraiment supprimer cette table ?',
      icon: 'warning',
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#4f46e5',
      showCancelButton: true
    });

    if (result.isConfirmed) {
      try {
        await gameAPI.deleteTable(id);
        refresh();
        Swal.fire({
          title: 'Succès',
          text: 'Table supprimée',
          icon: 'success',
          background: '#0f172a',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        });
      } catch {
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de supprimer la table',
          icon: 'error',
          background: '#0f172a',
          color: '#fff'
        });
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <h2 className="text-3xl font-black mb-10 flex items-center gap-3">
        <Settings className="text-indigo-500" size={32}/> PARAMÈTRES
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* TARIFS */}
        <section className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <h3 className="text-indigo-400 font-bold mb-6 flex items-center gap-2">
            <DollarSign size={20}/> TARIFS
          </h3>
          <div className="space-y-6">
            <InputSetting 
              label="Salle" 
              value={config.nom_salle} 
              onChange={(v) => setConfig({...config, nom_salle: v})} 
            />
            <InputSetting 
              label="Tarif (millimes/min)" 
              value={config.tarif_base} 
              onChange={(v) => setConfig({...config, tarif_base: v})} 
              type="number"
            />
            <InputSetting 
              label="Tarif réduit (millimes/min)" 
              value={config.tarif_reduit} 
              onChange={(v) => setConfig({...config, tarif_reduit: v})} 
              type="number"
            />
            <InputSetting 
              label="Seuil (millimes)" 
              value={config.seuil_prix} 
              onChange={(v) => setConfig({...config, seuil_prix: v})} 
              type="number"
            />
            <button 
              onClick={handleSaveConfig} 
              className="w-full bg-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-500 transition shadow-lg"
            >
              <Save size={20}/> ENREGISTRER
            </button>
          </div>
        </section>

        {/* TABLES */}
        <section className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <h3 className="text-emerald-400 font-bold mb-6 flex items-center gap-2">
            <Play size={20}/> TABLES
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nom de la table..." 
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-2xl outline-none focus:border-emerald-500"
              />
              <button 
                onClick={handleAddTable}
                className="bg-emerald-600 px-4 rounded-2xl flex items-center justify-center hover:bg-emerald-500"
              >
                <Plus size={20}/>
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tables.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="font-bold">{t.nom}</span>
                  <button 
                    onClick={() => handleDeleteTable(t.id)} 
                    className="text-rose-500 p-2 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// --- INPUT COMPONENT ---
function InputSetting({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 p-4 rounded-2xl outline-none focus:border-indigo-500 font-mono text-lg text-indigo-400"
      />
    </div>
  );
}

export default App;
