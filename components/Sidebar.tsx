
import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  CreditCard,
  History,
  TrendingUp,
  X,
  Compass
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setOpen, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel Geral' },
    { id: 'intelligence', icon: Compass, label: 'Inteligência' },
    { id: 'history', icon: History, label: 'Consultas Recentes' },
    { id: 'billing', icon: CreditCard, label: 'Minha Assinatura' },
    { id: 'account', icon: User, label: 'Configurações' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/80 z-[110] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[120] w-full max-w-[300px] bg-zinc-950 border-r border-white/5 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="p-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <TrendingUp className="text-white" size={20} strokeWidth={3} />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">Nova<span className="text-emerald-500">.</span>Int</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2 text-zinc-500">
            <X size={24} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-6 space-y-2 mt-4">
          <div className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-6">Módulos do Sistema</div>
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if(window.innerWidth < 1024) setOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group
                ${activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'}
              `}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-zinc-400'} />
              <span className="font-bold text-[15px]">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer Sidebar Profile */}
        <div className="p-8">
          <div className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-zinc-900 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Analista Dados</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Nível de Acesso 3</p>
            </div>
            <Settings size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
