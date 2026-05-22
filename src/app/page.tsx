"use client";

import { useEffect, useState } from 'react';
import { Check, X, Database } from 'lucide-react';

interface PendingItem {
  id: number;
  payload: {
    product_name: string;
    barcode: string;
    source_frame: string;
    crop_file: string;
    siglip_similarity_score: number;
  }
}

export default function Dashboard() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/pending');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      } else {
        const error = await res.json();
        alert(`Failed to approve: ${error.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8">
      <header className="mb-10 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="text-blue-500 w-8 h-8" /> Qdrant Ingestion Review
          </h1>
          <p className="text-slate-400 mt-2">Human-in-the-Loop visual validation before vector insertion</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-xl shadow-inner">
          <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Pending Approvals</span>
          <div className="text-3xl font-bold text-blue-400 text-center mt-1">{items.length}</div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
          <Check className="w-16 h-16 text-emerald-500 mb-4 opacity-80" />
          <h2 className="text-xl font-medium text-white">All Caught Up!</h2>
          <p className="text-slate-400 mt-2">No pending items to review. Run the extraction pipeline to generate more.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:border-slate-700 hover:shadow-xl ${processingId === item.id ? 'opacity-50 scale-95' : ''}`}
            >
              <div className="h-64 w-full bg-black relative flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`/api/image?file=${item.payload.crop_file}`} 
                  alt={item.payload.product_name}
                  className="max-h-full max-w-full object-contain drop-shadow-2xl"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl">
                  <span className={`w-2 h-2 rounded-full ${item.payload.siglip_similarity_score > 0.1 ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                  <span className="text-xs font-mono text-white/90">Conf: {item.payload.siglip_similarity_score.toFixed(3)}</span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{item.payload.product_name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-2">{item.payload.barcode}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => handleReject(item.id)}
                    disabled={processingId !== null}
                    className="flex-1 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/50 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(item.id)}
                    disabled={processingId !== null}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 hover:border-blue-400 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-lg shadow-blue-500/20 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
