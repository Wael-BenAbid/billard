import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, TrendingUp, AlertCircle, Play, CheckCircle, DollarSign, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = '/api/manager';

function Dashboard() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterUnpaid, setFilterUnpaid] = useState(false);
  const [nextPlayerA, setNextPlayerA] = useState('');
  const [nextPlayerB, setNextPlayerB] = useState('');
  const [loading, setLoading] = useState(true);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    refreshData();
  }, [search, filterUnpaid]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('nom', search);
      if (filterUnpaid) params.append('paye', 'false');
      
      const gamesRes = await axios.get(`${API_URL}/parties/?${params}`);
      setGames(gamesRes.data);
      
      const statsRes = await axios.get(`${API_URL}/parties/get_stats/`);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search clients with debounce using the new search_client endpoint
  const searchClients = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const res = await axios.get(`${API_URL}/parties/search_client/?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data.slice(0, 8)); // Limit to 8 results
      setShowSearchDropdown(true);
    } catch (error) {
      console.error('Error searching clients:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchClients(value);
    }, 200);
  };

  const selectClient = (client) => {
    setSearch(client.nom);
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearch('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const markPaid = async (id) => {
    try {
      await axios.post(`${API_URL}/parties/${id}/pay/`);
      refreshData();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const setNextPlayer = async (id, nextPlayer) => {
    try {
      await axios.post(`${API_URL}/parties/${id}/set_next_player/`, { next_player: nextPlayer });
    } catch (error) {
      console.error('Error setting next player:', error);
    }
  };

  const formatCurrency = (value) => {
    return `${parseFloat(value || 0).toFixed(2)} DT`;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Gestion Billard</h1>
        <p className="welcome-message">Bienvenue, {user?.email || 'Admin'}</p>
      </header>

      {/* DASHBOARD STATS */}
      <div className="stats-grid">
        <StatBox 
          title="Revenu Total" 
          value={formatCurrency(stats.total_money)} 
          icon={<TrendingUp color="#4ade80"/>} 
        />
        <StatBox 
          title="Heure Pic" 
          value={`${stats.peak_hour || 0}h`} 
          icon={<TrendingUp color="#fbbf24"/>} 
        />
        <StatBox 
          title="Non Payés" 
          value={stats.unpaid_count || 0} 
          icon={<AlertCircle color="#f87171"/>} 
        />
        <StatBox 
          title="Total Parties" 
          value={stats.total_games || 0} 
          icon={<CheckCircle color="#60a5fa"/>} 
        />
      </div>

      {/* TABLE CARDS */}
      <div className="tables-grid">
        <TableCard 
          name="BILLARD A" 
          next={nextPlayerA} 
          setNext={setNextPlayerA} 
          tableNumero={1}
        />
        <TableCard 
          name="BILLARD B" 
          next={nextPlayerB} 
          setNext={setNextPlayerB} 
          tableNumero={2}
        />
      </div>

      {/* FILTERS */}
      <div className="filters-bar">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher nom/prénom..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <button 
          onClick={() => setFilterUnpaid(!filterUnpaid)}
          className={`filter-button ${filterUnpaid ? 'active' : ''}`}
        >
          {filterUnpaid ? "Voir Dettes Uniquement" : "Tout l'historique"}
        </button>
      </div>

      {/* HISTORY TABLE */}
      <div className="history-table-container">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Table</th>
                <th>Prix</th>
                <th>Prochain</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id}>
                  <td className="client-name">{g.client_info?.nom || '---'}</td>
                  <td>Table {g.table_numero}</td>
                  <td className="price">{formatCurrency(g.prix)}</td>
                  <td className="next-player">{g.next_player || '-'}</td>
                  <td>
                    <button 
                      onClick={() => markPaid(g.id)}
                      className={`px-4 py-1 rounded font-bold ${g.est_paye ? 'bg-green-500' : 'bg-red-500'} text-white hover:opacity-80 transition-opacity`}
                    >
                      {g.est_paye ? "OUI" : "NON"}
                    </button>
                  </td>
                  <td>
                    {!g.est_paye && (
                      <button 
                        onClick={() => markPaid(g.id)} 
                        className="pay-button"
                      >
                        <DollarSign size={14} /> Encaisser
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">Aucune partie trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// COMPOSANTS REUTILISABLES
function StatBox({ title, value, icon }) {
  return (
    <div className="stat-box">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

function TableCard({ name, next, setNext, tableNumero }) {
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    if (!clientName) {
      alert('Veuillez entrer un nom de client');
      return;
    }
    
    setLoading(true);
    try {
      // Create client if doesn't exist
      const clientRes = await axios.post(`${API_URL}/clients/`, {
        nom: clientName,
        telephone: '',
      });
      
      // Start game
      await axios.post(`${API_URL}/parties/`, {
        table: tableNumero,
        client: clientRes.data.id,
        next_player: next,
      });
      
      setClientName('');
      setNext('');
      window.location.reload();
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Erreur lors du démarrage de la partie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="table-card">
      <h2 className="table-name">{name}</h2>
      <div className="next-player-input">
        <label>PROCHAIN JOUEUR</label>
        <input 
          type="text" 
          value={next} 
          onChange={(e) => setNext(e.target.value)}
          placeholder="Qui joue après ?"
        />
      </div>
      <div className="client-input">
        <label>CLIENT ACTUEL</label>
        <input 
          type="text" 
          value={clientName} 
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nom du client"
        />
      </div>
      <button 
        onClick={startGame} 
        className="start-button"
        disabled={loading}
      >
        <Play size={20} /> 
        {loading ? 'Démarrage...' : 'START GAME'}
      </button>
    </div>
  );
}

export default Dashboard;
