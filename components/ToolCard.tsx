
import React from 'react';
import { 
  Database, 
  Phone, 
  Users, 
  ShieldCheck, 
  Target, 
  User, 
  Search,
  ArrowRight,
  FileText,
  BadgeCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { ServiceTool } from '../types';

interface ToolCardProps {
  tool: ServiceTool;
  onConsult: () => void;
}

const iconMap: Record<string, any> = {
  Database,
  Phone,
  Users,
  ShieldCheck,
  Target,
  User,
  FileText
};

const ToolCard: React.FC<ToolCardProps> = ({ tool, onConsult }) => {
  const Icon = iconMap[tool.icon] || Search;

  return (
    <div 
      onClick={onConsult}
      className="glass-card group p-7 lg:p-9 rounded-[2.5rem] flex flex-col h-full cursor-pointer relative overflow-hidden active:scale-95 transition-all duration-300"
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 blur-[70px] transition-all duration-500 opacity-10 group-hover:opacity-40 ${tool.isPremium ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl ${tool.isPremium ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
          <Icon size={28} strokeWidth={2} />
        </div>
        {tool.isPremium && (
          <div className="flex items-center gap-1 bg-zinc-900/80 border border-white/10 text-emerald-500 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-inner">
             <Zap size={10} fill="currentColor" /> Premium
          </div>
        )}
      </div>

      <div className="flex-1 relative z-10 space-y-2 mb-8">
        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.25em] group-hover:text-emerald-500/70 transition-colors">
          {tool.subtitle}
        </span>
        <h3 className="text-xl lg:text-2xl font-black text-white leading-tight tracking-tighter uppercase">
          {tool.title}
        </h3>
        <p className="text-zinc-500 text-sm font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">
          {tool.description}
        </p>
      </div>

      <div className="relative z-10">
         <button className="btn-consultar w-full py-4 rounded-2xl flex items-center justify-center gap-2 group-hover:brightness-110 transition-all">
            <span className="text-xs font-black uppercase tracking-widest">Acessar Consulta</span>
            <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </div>
  );
};

export default ToolCard;
