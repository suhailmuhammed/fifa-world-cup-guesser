import React, { useState } from 'react';

// Map team names to code and flag URL
export const TEAMS_MAP = {
  'Argentina': { code: 'AR', flag: 'https://flagcdn.com/ar.svg' },
  'Australia': { code: 'AU', flag: 'https://flagcdn.com/au.svg' },
  'Belgium': { code: 'BE', flag: 'https://flagcdn.com/be.svg' },
  'Brazil': { code: 'BR', flag: 'https://flagcdn.com/br.svg' },
  'Cameroon': { code: 'CM', flag: 'https://flagcdn.com/cm.svg' },
  'Canada': { code: 'CA', flag: 'https://flagcdn.com/ca.svg' },
  'Costa Rica': { code: 'CR', flag: 'https://flagcdn.com/cr.svg' },
  'Croatia': { code: 'HR', flag: 'https://flagcdn.com/hr.svg' },
  'Denmark': { code: 'DK', flag: 'https://flagcdn.com/dk.svg' },
  'Ecuador': { code: 'EC', flag: 'https://flagcdn.com/ec.svg' },
  'England': { code: 'GB-ENG', flag: 'https://flagcdn.com/gb-eng.svg' },
  'France': { code: 'FR', flag: 'https://flagcdn.com/fr.svg' },
  'Germany': { code: 'DE', flag: 'https://flagcdn.com/de.svg' },
  'Ghana': { code: 'GH', flag: 'https://flagcdn.com/gh.svg' },
  'Iran': { code: 'IR', flag: 'https://flagcdn.com/ir.svg' },
  'Japan': { code: 'JP', flag: 'https://flagcdn.com/jp.svg' },
  'Mexico': { code: 'MX', flag: 'https://flagcdn.com/mx.svg' },
  'Morocco': { code: 'MA', flag: 'https://flagcdn.com/ma.svg' },
  'Netherlands': { code: 'NL', flag: 'https://flagcdn.com/nl.svg' },
  'Poland': { code: 'PL', flag: 'https://flagcdn.com/pl.svg' },
  'Portugal': { code: 'PT', flag: 'https://flagcdn.com/pt.svg' },
  'Qatar': { code: 'QA', flag: 'https://flagcdn.com/qa.svg' },
  'Saudi Arabia': { code: 'SA', flag: 'https://flagcdn.com/sa.svg' },
  'Senegal': { code: 'SN', flag: 'https://flagcdn.com/sn.svg' },
  'Serbia': { code: 'RS', flag: 'https://flagcdn.com/rs.svg' },
  'South Korea': { code: 'KR', flag: 'https://flagcdn.com/kr.svg' },
  'Spain': { code: 'ES', flag: 'https://flagcdn.com/es.svg' },
  'Switzerland': { code: 'CH', flag: 'https://flagcdn.com/ch.svg' },
  'Tunisia': { code: 'TN', flag: 'https://flagcdn.com/tn.svg' },
  'USA': { code: 'US', flag: 'https://flagcdn.com/us.svg' },
  'Uruguay': { code: 'UY', flag: 'https://flagcdn.com/uy.svg' },
  'Wales': { code: 'GB-WLS', flag: 'https://flagcdn.com/gb-wls.svg' }
};

const Flag = ({ teamName, flagUrl, className = 'w-5.5 h-4 object-cover rounded-sm inline-block shadow-sm mr-1.5 align-middle', alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <span className="inline-block align-middle mr-1.5">⚽</span>;
  }

  if (flagUrl) {
    return (
      <img
        src={flagUrl}
        alt={alt || teamName || 'flag'}
        className={className}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  if (!teamName) {
    return <span className="inline-block align-middle mr-1.5">⚽</span>;
  }

  const team = TEAMS_MAP[teamName];

  if (!team) {
    return <span className="inline-block align-middle mr-1.5">⚽</span>;
  }

  return (
    <img
      src={team.flag}
      alt={alt || teamName}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export default Flag;
