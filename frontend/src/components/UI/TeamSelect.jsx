import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Flag from './Flag';

/**
 * Custom searchable dropdown for selecting teams with SVG flag images.
 * Replaces native <select> which cannot render images inside <option> tags.
 * Uses a React Portal to render the dropdown at document.body level,
 * avoiding all parent overflow/stacking-context clipping issues.
 *
 * Props:
 *  - options: Array of { name, code?, flag? } objects
 *  - value: Currently selected value (team name string)
 *  - onChange: Callback when a value is selected (receives name string)
 *  - placeholder: Placeholder text when nothing is selected
 *  - showFlags: Whether to render flag images (default true)
 *  - id: Optional ID for accessibility
 */
const TeamSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select Team...',
  showFlags = true,
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

  // Filter options based on search
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate dropdown position relative to the viewport (for portal)
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

  // Close on outside click (check both trigger and portal dropdown)
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

  // Reposition on scroll / resize while open
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

  // Focus search input when dropdown opens & position it
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      // Small delay to let the portal mount first
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

  // Find the currently selected option object
  const selectedOption = options.find(opt => opt.name === value);

  // Dropdown panel rendered via portal
  const dropdownPanel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/95 backdrop-blur-xl"
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
                placeholder="Search..."
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
                No teams found matching "{searchQuery}"
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = option.name === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={option.name}
                    data-option
                    onClick={() => handleSelect(option.name)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors duration-100 text-sm select-none ${
                      isHighlighted
                        ? 'bg-fifa-gold/10 text-white'
                        : 'hover:bg-white/5 text-slate-300'
                    } ${isSelected ? 'bg-fifa-gold/5 font-bold text-fifa-gold' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {showFlags && (
                      <Flag
                        teamName={option.name}
                        className="w-6 h-4 object-cover rounded-sm shadow-sm shrink-0"
                      />
                    )}
                    <span className="truncate flex-1">{option.name}</span>
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
        className={`w-full bg-slate-900/60 border rounded-xl px-4 py-3 text-left flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'border-fifa-gold ring-1 ring-fifa-gold/20'
            : 'border-white/10 hover:border-white/20 focus:border-fifa-gold'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption ? (
            <>
              {showFlags && (
                <Flag
                  teamName={selectedOption.name}
                  className="w-6 h-4 object-cover rounded-sm shadow-sm shrink-0"
                />
              )}
              <span className="text-sm font-semibold text-white truncate">
                {selectedOption.name}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-500">{placeholder}</span>
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

      {/* Dropdown rendered via Portal to escape parent stacking contexts */}
      {createPortal(dropdownPanel, document.body)}
    </div>
  );
};

export default TeamSelect;
