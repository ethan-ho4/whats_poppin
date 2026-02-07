import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, Newspaper } from 'lucide-react';
import { countryNews } from '../data/mockData';

const NewsPanel = ({ selectedCountry, countryName, onClose }) => {
    const articles = selectedCountry ? countryNews[selectedCountry] : [];

    return (
        <AnimatePresence>
            {selectedCountry && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-black/40 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-white/5 to-transparent">
                        <div>
                            <div className="text-xs font-mono text-blue-400 mb-1">LIVE FEED</div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">{countryName || selectedCountry}</h2>
                            <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {articles?.length || 0} Active Stories
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {!articles || articles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <Newspaper size={48} className="mb-4 opacity-20" />
                                <p>No recent news available for this region.</p>
                            </div>
                        ) : (
                            articles.map((article) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300"
                                >
                                    <div className="h-40 overflow-hidden relative">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <div className="absolute bottom-3 left-3 text-xs font-medium px-2 py-1 bg-blue-500/80 backdrop-blur-md rounded text-white">
                                            {article.source}
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                            <Calendar size={12} />
                                            <span>{article.date}</span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors">
                                            {article.title}
                                        </h3>

                                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                            {article.summary}
                                        </p>

                                        <button className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
                                            Read Full Story <ExternalLink size={12} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        <div className="pt-8 text-center">
                            <p className="text-xs text-gray-600">
                                Data provided by WorldNews API • Updated just now
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewsPanel;
