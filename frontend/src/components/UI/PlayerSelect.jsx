import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Flag from './Flag';

/**
 * Custom searchable dropdown for selecting players with country flags and photo thumbnails.
 * Replaces native <select> for premium styling, searchability, and image support.
 * Uses React Portal to avoid parent stacking context clipping.
 *
 * Props:
 *  - options: Array of { id, name, country, position, photo, countryFlag }
 *  - value: Currently selected player name string
 *  - onChange: Callback when value is selected (receives name string)
 *  - placeholder: Placeholder text
 *  - id: Optional ID for accessibility
 */
const PlayerSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select Player...',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const dropdownRef = useRef(null);

  // Append "Other Player" to options
  const allOptions = [
    ...options,
    {
      id: 'other',
      name: 'Other Player',
      country: 'Custom Player',
      position: 'Any position',
      photo: null,
      countryFlag: null
    }
  ];

  // Filter options based on search (name or country)
  const filteredOptions = allOptions.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate dropdown position relative to viewport (Portal placement)
  const updateDropdownPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownMaxHeight = 320;
    const openAbove = spaceBelow < dropdownMaxHeight && rect.top > spaceBelow;

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reposition on scroll / resize
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updateDropdownPosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-option]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
    }
  };

  const handleSelect = (optionName) => {
    onChange(optionName);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setSearchQuery('');
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].name);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      default:
        break;
    }
  };

  // Find the currently selected option object or treat value as a custom option
  const selectedOption = allOptions.find(opt => opt.name === value) || (value ? {
    id: 'custom-val',
    name: value,
    country: 'Custom Player',
    position: 'Custom',
    photo: null,
    countryFlag: null
  } : null);

  // Helper to render player thumbnail photo or generic silhouette
  const renderPlayerPhoto = (photo, name, sizeClass = "w-8 h-8") => {
    if (photo) {
      return (
        <img
          src={photo}
          alt={name}
          className={`${sizeClass} rounded-full object-cover border border-white/10`}
          loading="lazy"
        />
      );
    }

    return (
      <div className={`${sizeClass} rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shrink-0`}>
        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    );
  };

  const dropdownPanel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/95 backdrop-blur-xl select-none"
          style={{ ...dropdownStyle, maxHeight: '320px' }}
        >
          {/* Search Input */}
          <div className="p-2.5 border-b border-white/5">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search players by name or country..."
                className="w-full bg-slate-800/60 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fifa-gold/40 transition-colors"
              />
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: '256px' }}
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-500">
                No players found matching "{searchQuery}"
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = option.name === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={option.id + '-' + option.name}
                    data-option
                    onClick={() => handleSelect(option.name)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center gap-3 px-3.5 py-2 cursor-pointer transition-colors duration-100 select-none ${
                      isHighlighted
                        ? 'bg-fifa-gold/10 text-white'
                        : 'hover:bg-white/5 text-slate-300'
                    } ${isSelected ? 'bg-fifa-gold/5 font-bold text-fifa-gold' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {/* Player Photo */}
                    {renderPlayerPhoto(option.photo, option.name, "w-8 h-8")}

                    {/* Player Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {option.countryFlag ? (
                          <Flag
                            flagUrl={option.countryFlag}
                            alt={option.country}
                            className="w-4 h-3 object-cover rounded-sm shadow-sm shrink-0"
                          />
                        ) : (
                          option.id === 'other' ? null : <span className="text-xxs shrink-0">⚽</span>
                        )}
                        <span className="text-sm font-semibold text-white truncate flex-1">
                          {option.name}{option.id !== 'other' && ` — ${option.country}`}
                        </span>
                      </div>
                      <div className="text-xxs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{option.country}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="text-fifa-gold/80">{option.position}</span>
                      </div>
                    </div>

                    {/* Selected Mark */}
                    {isSelected && (
                      <svg className="h-4 w-4 text-fifa-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className="relative" id={id}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full bg-slate-900/60 border rounded-xl px-4 py-2.5 text-left flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'border-fifa-gold ring-1 ring-fifa-gold/20'
            : 'border-white/10 hover:border-white/20 focus:border-fifa-gold'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3 min-w-0 flex-1">
          {selectedOption ? (
            <>
              {renderPlayerPhoto(selectedOption.photo, selectedOption.name, "w-7 h-7")}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  {selectedOption.countryFlag ? (
                    <Flag
                      flagUrl={selectedOption.countryFlag}
                      alt={selectedOption.country}
                      className="w-4 h-3 object-cover rounded-sm shadow-sm shrink-0"
                    />
                  ) : (
                    selectedOption.id === 'other' ? null : <span className="text-xxs shrink-0">⚽</span>
                  )}
                  <span className="text-sm font-semibold text-white truncate">
                    {selectedOption.name}{selectedOption.id !== 'other' && ` — ${selectedOption.country}`}
                  </span>
                </div>
                <span className="text-xxs text-slate-400">
                  {selectedOption.country} • {selectedOption.position}
                </span>
              </div>
            </>
          ) : (
            <span className="text-sm text-slate-500 py-1">{placeholder}</span>
          )}
        </span>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Render Dropdown via Portal */}
      {createPortal(dropdownPanel, document.body)}
    </div>
  );
};

export default PlayerSelect;
