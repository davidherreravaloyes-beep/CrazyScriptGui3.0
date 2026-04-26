import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Heart, Clock, User, Gamepad2, Download, Flame, Loader2, Gem, Gavel, Star } from 'lucide-react';
import { Script } from '../constants';
import { cn } from '../lib/utils';

interface ScriptCardProps {
  script: Script;
  index: number;
  onClick: (s: Script) => void;
  onSelectUser?: (userId: string) => void;
  key?: string | number;
}

export function ScriptCard({ script, index, onClick, onSelectUser }: ScriptCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isAdminAuthor = script.author === 'D4VIDSKYS' || script.author === 'Admin' || script.author === 'CrazyGui' || script.author === 'D4VIDSKY';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(script)}
      className="group relative bg-[#151921]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-brand/30 transition-all cursor-pointer shadow-xl flex flex-col"
    >
      {/* Thumbnail Area */}
      <div className="relative h-44 overflow-hidden bg-zinc-900/50">
        <AnimatePresence>
          {!isLoaded && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-800/40 flex items-center justify-center overflow-hidden z-10"
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Author Overlap */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onSelectUser?.(script.authorId || '');
            }}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-brand transition-all overflow-hidden"
          >
            {script.authorPhoto ? (
              <img src={script.authorPhoto} alt={script.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={14} className="text-white" />
            )}
          </div>
          <div className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
            <span className="text-[9px] font-bold text-white uppercase tracking-wider whitespace-nowrap">@{script.author || 'Anonymous'}</span>
          </div>
        </div>

        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          src={script.thumbnail || 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=800&auto=format&fit=crop&q=60'} 
          alt={script.title}
          referrerPolicy="no-referrer"
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallback = 'https://images.unsplash.com/photo-1614680376593-902f74cc0d41?w=800&auto=format&fit=crop&q=60';
            if (target.src !== fallback) {
              target.src = fallback;
            }
            setIsLoaded(true);
          }}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
            !isLoaded && "invisible"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151921] via-transparent to-transparent opacity-60" />
        
        {/* Category Badge on Image */}
        <div className="absolute bottom-3 left-4">
          <div className="px-3 py-1 bg-brand/20 backdrop-blur-md rounded-md border border-brand/20">
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
              {script.game}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Status Icons */}
        <div className="flex items-center justify-end mb-4 gap-2">
           {script.isPremium && (
             <Gem size={14} className="text-brand animate-pulse" fill="currentColor" />
           )}
           {script.isTrending && (
             <Flame size={14} className="text-orange-500" />
           )}
        </div>

        {/* Title & Description */}
        <div className="relative mb-6 flex-1">
          <div className="pr-16">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand transition-colors line-clamp-1">
              {script.title}
            </h3>
            <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
              {script.description}
            </p>
          </div>
          
          <div className="absolute right-0 top-0">
             <span className="text-[9px] text-zinc-600 bg-white/5 px-2 py-1 rounded uppercase font-bold tracking-widest border border-white/5 whitespace-nowrap">
               {script.category}
             </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <Clock size={10} />
              <span>{script.updatedAt}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="opacity-50" />
              <span className="text-xs font-mono">{script.views >= 1000 ? `${(script.views/1000).toFixed(1)}K` : script.views}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="opacity-50" />
              <span className="text-xs font-mono">{script.likes >= 1000 ? `${(script.likes/1000).toFixed(1)}K` : script.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FilterBar({ 
  selectedCategory, 
  onSelectCategory,
  categories 
}: { 
  selectedCategory: string, 
  onSelectCategory: (cat: string) => void,
  categories: string[]
}) {
  return (
    <div className="flex items-center justify-center gap-3 mb-16 flex-wrap px-4">
      {categories.map((category) => (
        <motion.button
          key={category}
          onClick={() => onSelectCategory(category)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all border",
            selectedCategory === category 
              ? "bg-brand text-white border-brand shadow-[0_0_15px_-5px_rgba(139,92,246,0.5)]" 
              : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/10 hover:text-white"
          )}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
}
