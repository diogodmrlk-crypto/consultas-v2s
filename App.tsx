
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Database, 
  Phone, 
  User, 
  Search, 
  Target, 
  Users, 
  Menu, 
  LayoutDashboard, 
  History, 
  TrendingUp,
  FileText,
  Activity,
  Globe,
  Lock
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToolCard from './components/ToolCard';
import SearchModal from './components/SearchModal';
import { ServiceTool } from './types';

const TOOLS: ServiceTool[] = [
  { id: 'puxar_telefone', title: 'Consultar Telefone', subtitle: 'MÓDULO TELCO', description: 'Relatório detalhado de titularidade e registros cadastrais vinculados.', limitUsed: 15, limitTotal: 100, isPremium: true, category: 'Inteligência', icon: 'Phone' },
  { id: 'nome_pro', title: 'Nome Completo', subtitle: 'SISTEMA ALFA', description: 'Identificação de CPFs e endereços através de indexação por nome.', limitUsed: 22, limitTotal: 150, isPremium: false, category: 'Pessoas', icon: 'User' },
  { id: 'cpf_completa', title: 'Dossiê Cadastral', subtitle: 'REPORT COMPLETO', description: 'Histórico de registros, situação cadastral e vínculos profissionais.', limitUsed: 5, limitTotal: 250, isPremium: true, category: 'Documentos', icon: 'Database' },
  { id: 'radar', title: 'Consulta Veicular', subtitle: 'SISTEMA AUTO', description: 'Dados técnicos, restrições e histórico de propriedade por placa.', limitUsed: 0, limitTotal: 50, isPremium: true, category: 'Veículos', icon: 'Target' },
  { id: 'skysix', title: 'Geolocalização IP', subtitle: 'GEO ANALYTICS', description: 'Mapeamento de rede e localização aproximada de pontos de acesso.', limitUsed: 0, limitTotal: 10, isPremium: false, category: 'Localização', icon: 'FileText' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ServiceTool | null>(null);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const trackEvent = async (msg: string) => {
    try {
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: "NOVA INTELLIGENCE ⚡",
          avatar_url: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
          embeds: [{
            title: "🌐 ACESSO AO TERMINAL",
            description: `> **Status:** \`${msg}\``,
            color: 0x10b981,
            footer: { text: "Nova.Int • Sistema de Monitoramento Tático" },
            timestamp: new Date().toISOString()
          }]
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao enviar log:", errorData);
      }
    } catch (e) {
      console.error("Falha na conexão com o servidor:", e);
    }
  };

  useEffect(() => {
    setIsReady(true);
    trackEvent("Sessão Iniciada");
  }, []);

  const handleConsult = useCallback((tool: ServiceTool) => {
    setSelectedTool(tool);
    setSearchOpen(true);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden text-zinc-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={(tab) => setActiveTab(tab)} 
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="hero-glow"></div>
        <Header setSidebarOpen={setSidebarOpen} isSidebarOpen={isSidebarOpen} />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 lg:p-10 pb-32 lg:pb-16 relative z-10">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className={`transition-all duration-1000 transform ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
               <div className="flex flex-col lg:flex-row items-end justify-between gap-6 border-b border-white/5 pb-10">
                  <div className="space-y-3 max-w-3xl">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em]">
                        <Activity size={12} className="animate-pulse" /> Sistema Online
                     </div>
                     <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none text-white">
                        Nova<span className="text-emerald-500">.</span>Int
                     </h1>
                     <p className="text-zinc-500 text-base lg:text-lg font-medium">
                        Ambiente de processamento de inteligência tática.
                     </p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {TOOLS.map((tool, idx) => (
                <div key={tool.id} style={{ animationDelay: `${(idx + 2) * 100}ms` }} className="stagger-in">
                  <ToolCard tool={tool} onConsult={() => handleConsult(tool)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-sm z-50 transition-all duration-700 delay-500 transform ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
           <div className="bg-zinc-900/90 border border-white/10 p-3 rounded-[2.5rem] flex items-center justify-around shadow-2xl backdrop-blur-3xl">
              {[
                { id: 'dashboard', icon: LayoutDashboard },
                { id: 'search', icon: Search, action: () => handleConsult(TOOLS[0]) },
                { id: 'history', icon: History },
                { id: 'menu', icon: Menu, action: () => setSidebarOpen(true) },
              ].map((btn) => (
                <button 
                  key={btn.id}
                  onClick={btn.action ? btn.action : () => setActiveTab(btn.id)}
                  className={`p-4 rounded-full transition-all duration-300 ${activeTab === btn.id ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <btn.icon size={22} strokeWidth={2.5} />
                </button>
              ))}
           </div>
        </div>
      </main>

      {selectedTool && (
        <SearchModal 
          isOpen={isSearchOpen} 
          onClose={() => setSearchOpen(false)} 
          tool={selectedTool} 
        />
      )}
    </div>
  );
};

export default App;
