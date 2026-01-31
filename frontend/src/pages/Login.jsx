export default function Login() {
  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-200/50 border border-white">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black italic mx-auto mb-4">B</div>
          <h2 className="text-3xl font-black text-gray-900">Content de vous revoir</h2>
          <p className="text-gray-400 font-medium">Connectez-vous pour gérer la salle</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Identifiant</label>
            <input type="text" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-600" placeholder="admin_wael" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Mot de passe</label>
            <input type="password" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:border-indigo-600" placeholder="••••••••" />
          </div>
          <button className="w-full bg-gray-900 text-white hover:bg-indigo-600 py-5 rounded-2xl font-black shadow-xl shadow-gray-200 transition-all active:scale-95">
            Se connecter au Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
