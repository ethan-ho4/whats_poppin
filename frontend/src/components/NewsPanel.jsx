import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, Newspaper } from 'lucide-react';
import { countryNews } from '../data/mockData';

const NewsPanel = ({ selectedCountry, countryName, onClose }) => {
    const articles = selectedCountry ? countryNews[selectedCountry] : [];

    if (!selectedCountry) return null;

    return (
        <div className="h-auto max-h-screen w-full bg-[#0f172a] border-r border-b border-white/20 shadow-2xl rounded-br-2xl flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-white/5 to-transparent flex-shrink-0">
                <div>
                    <div className="text-[10px] font-mono text-blue-400 mb-1">LIVE FEED</div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{countryName || selectedCountry}</h2>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        {articles?.length || 0} Active Stories
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {!articles || articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <Newspaper size={32} className="mb-3 opacity-20" />
                        <p className="text-sm">No recent news available.</p>
                    </div>
                ) : (
                    articles.map((article) => (
                        <div
                            key={article.id}
                            className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg overflow-hidden transition-all duration-300"
                        >
                            <div className="h-28 overflow-hidden relative">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-2 left-2 text-[10px] font-medium px-1.5 py-0.5 bg-blue-500/80 backdrop-blur-md rounded text-white">
                                    {article.source}
                                </div>
                            </div>

                            <div className="p-3">
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-2">
                                    <Calendar size={10} />
                                    <span>{article.date}</span>
                                </div>

                                <h3 className="text-base font-semibold text-white mb-1.5 leading-snug group-hover:text-blue-400 transition-colors">
                                    {article.title}
                                </h3>

                                <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-3">
                                    {article.summary}
                                </p>

                                <button className="flex items-center gap-1.5 text-[10px] font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
                                    Read Full Story <ExternalLink size={10} />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                <div className="pt-8 text-center">
                    <p className="text-xs text-gray-600">
                        Data provided by WorldNews API • Updated just now
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NewsPanel;
