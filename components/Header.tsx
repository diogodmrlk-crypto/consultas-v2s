
import React from 'react';
import { Bell, Search, Menu, User } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, isSidebarOpen }) => {
  return (
    <header className="h-20 border-b border-zinc-800/50 bg-[#0a0a0b]/80 backdrop-blur-md px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar ferramenta ou consulta..."
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-300 w-80 focus:outline-none focus:border-green-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-[#0a0a0b]"></span>
        </button>
        <div className="h-10 w-[1px] bg-zinc-800 mx-2 hidden sm:block"></div>
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-sm font-bold text-white leading-none">Status do Sistema</p>
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online & Estável
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
