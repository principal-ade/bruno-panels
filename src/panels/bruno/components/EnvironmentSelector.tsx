import React, { useState } from 'react';
import { Globe, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import type { BrunoEnvironment } from '../../../types';

export interface EnvironmentSelectorProps {
  environments: BrunoEnvironment[];
  selectedEnvironment: BrunoEnvironment | null;
  onSelectEnvironment: (environment: BrunoEnvironment | null) => void;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  environments,
  selectedEnvironment,
  onSelectEnvironment,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const env = environments.find((env) => env.name === e.target.value);
    onSelectEnvironment(env || null);
    setRevealedSecrets(new Set());
  };

  const toggleSecret = (name: string) => {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const enabledVariables = selectedEnvironment?.variables.filter((v) => v.enabled) || [];

  return (
    <div style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
        }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            background: 'transparent',
            border: 'none',
            color: theme.colors.textMuted,
            cursor: 'pointer',
          }}
          title={isExpanded ? 'Hide variables' : 'Show variables'}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <Globe size={14} color={theme.colors.textMuted} />
        <select
          value={selectedEnvironment?.name || ''}
          onChange={handleChange}
          style={{
            flex: 1,
            background: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {environments.map((env) => (
            <option key={env.name} value={env.name}>
              {env.name}
            </option>
          ))}
        </select>
      </div>

      {isExpanded && selectedEnvironment && (
        <div
          style={{
            padding: '0 12px 8px 12px',
            fontSize: '11px',
          }}
        >
          {enabledVariables.length === 0 ? (
            <div style={{ color: theme.colors.textMuted, padding: '4px 0' }}>
              No variables defined
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: theme.colors.backgroundSecondary,
                borderRadius: '4px',
                padding: '8px',
              }}
            >
              {enabledVariables.map((variable) => (
                <div
                  key={variable.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      color: theme.colors.primary,
                      fontFamily: theme.fonts.monospace,
                      minWidth: '100px',
                    }}
                  >
                    {variable.name}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      color: theme.colors.text,
                      fontFamily: theme.fonts.monospace,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {variable.secret && !revealedSecrets.has(variable.name)
                      ? '••••••••'
                      : variable.value}
                  </span>
                  {variable.secret && (
                    <button
                      onClick={() => toggleSecret(variable.name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px',
                        background: 'transparent',
                        border: 'none',
                        color: theme.colors.textMuted,
                        cursor: 'pointer',
                      }}
                      title={revealedSecrets.has(variable.name) ? 'Hide' : 'Reveal'}
                    >
                      {revealedSecrets.has(variable.name) ? (
                        <EyeOff size={12} />
                      ) : (
                        <Eye size={12} />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
