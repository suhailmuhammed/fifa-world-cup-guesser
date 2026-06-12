import React, { useState } from 'react';
import { TEAMS_MAP } from '../../data/teams';

const Flag = ({ teamName, flagUrl, className = 'w-6 h-4 object-cover rounded-sm inline-block shadow-sm mr-1.5 align-middle', alt }) => {
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
