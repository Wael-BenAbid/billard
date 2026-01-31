import React, { useState } from 'react';
import { Play, Users, CreditCard, History, Plus, UserCircle, LogOut, LayoutDashboard } from 'lucide-react';

function App() {
  const [userRole] = useState("ADMIN"); // Simulé pour le test

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      {/* SIDEBAR - Gestion des accès */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black italic">B</div>
          <h1 className="text-xl font-bold tracking-tight">BillardPro</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active />
          <NavItem icon={<History size={18}/>} label="Historique" />
          <NavItem icon={<Users size={18}/>} label="Clients" />
          {userRole === "ADMIN" && (
            <NavItem icon={<UserCircle size={18}/>} label="Gestion Employés" color="text-indigo-600" />
          )}
        </nav>

        <div className="pt-6 border-t border-gray-100">
          <button className="flex items-center gap-3 text-red-500 font-semibold px-4 py-2 hover:bg-red-50 rounded-xl w-full transition">
            <LogOut size={18}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 p-10">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Tableau de Bord</h2>
            <p className="text-gray-500 font-medium">Suivi de la salle en temps réel</p>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-gray-200 flex items-center gap-3 px-4 shadow-sm">
             <span className="text-xs font-bold text-gray-400 uppercase">Session :</span>
             <span className="text-sm font-bold text-indigo-600">{userRole}</span>
          </div>
        </header>

        {/* STATS - Style Clair */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Recette Jour" value="450 DT" icon={<CreditCard className="text-emerald-600"/>} bg="bg-emerald-50" />
          <StatCard title="Heure Pic" value="21h" icon={<History className="text-blue-600"/>} bg="bg-blue-50" />
          <StatCard title="Dettes" value="120 DT" icon={<Plus className="text-rose-600"/>} bg="bg-rose-50" />
          <StatCard title="Clients Actifs" value="12" icon={<Users className="text-amber-600"/>} bg="bg-amber-50" />
        </div>

        {/* TABLES - Design épuré */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <TableCard name="BILLARD A" />
          <TableCard name="BILLARD B" />
        </div>

        {/* TABLEAU DES PARTIES - Look Clean */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h3 className="font-bold text-gray-800">Parties Récentes</h3>
             <button className="text-sm font-bold text-indigo-600 hover:underline">Voir tous les rapports</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="px-8 py-4 font-black">Client</th>
                <th className="px-8 py-4 font-black">Table</th>
                <th className="px-8 py-4 font-black">Prix</th>
                <th className="px-8 py-4 font-black">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <TableRow name="Mohamed Ben Ali" table="A" price="15.5" status="PAYÉ" />
              <TableRow name="Ahmed Mansour" table="B" price="12.0" status="À PAYER" />
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

// COMPOSANTS POUR LE NOUVEAU STYLE
function NavItem({ icon, label, active, color }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-50 text-indigo-600 font-bold' : `text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium ${color}`}`}>
      {icon} <span>{label}</span>
    </div>
  );
}

function StatCard({ title, value, icon, bg }) {
  return (
    <div className={`p-6 rounded-3xl border border-gray-100 bg-white shadow-sm flex items-center gap-5 hover:shadow-md transition`}>
      <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function TableCard({ name }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase mb-2 inline-block">Table Libre</span>
          <h3 className="text-3xl font-black text-gray-900">{name}</h3>
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 italic font-black">A</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Client</label>
          <div className="flex gap-2">
            <input type="text" placeholder="Nom..." className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:border-indigo-500 text-sm" />
            <button className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 shadow-indigo-100 shadow-lg"><Plus size={18}/></button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Suivant</label>
          <input type="text" placeholder="Nom..." className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl outline-none focus:border-indigo-500 text-sm" />
        </div>
      </div>

      <button className="w-full bg-gray-900 text-white hover:bg-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition shadow-lg active:scale-95">
        <Play size={18} fill="currentColor"/> Démarrer la session
      </button>
    </div>
  );
}

function TableRow({ name, table, price, status }) {
  const isPaid = status === "PAYÉ";
  return (
    <tr className="hover:bg-gray-50/50 transition">
      <td className="px-8 py-5 font-bold text-gray-700">{name}</td>
      <td className="px-8 py-5"><span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-500">BILLARD {table}</span></td>
      <td className="px-8 py-5 font-bold text-gray-900">{price} DT</td>
      <td className="px-8 py-5">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

export default App;
