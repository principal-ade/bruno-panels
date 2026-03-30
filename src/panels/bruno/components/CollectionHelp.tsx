import React, { useState, useCallback } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';

const BRUNO_LOGO_URL = 'https://www.usebruno.com/bruno-logo.png';

const BRU_FILE_INFO = `# Bruno .bru File Format

Bruno uses a simple, human-readable format for API requests stored as .bru files.

## Basic Structure

\`\`\`bru
meta {
  name: Request Name
  type: http
  seq: 1
}

get {
  url: https://api.example.com/endpoint
}

headers {
  Authorization: Bearer {{token}}
  Content-Type: application/json
}

body:json {
  {
    "key": "value"
  }
}
\`\`\`

## HTTP Methods
- get, post, put, patch, delete, options, head

## Variables
Use \`{{variableName}}\` syntax for environment variables.
`;

const VALIDATION_API_INFO = `# Bruno Validation API (ADE)

The Principal ADE exposes a REST API via the Principal MCP Bridge for validating and parsing .bru files.

## Endpoints

### Validate .bru Content
\`\`\`
POST /api/bruno/validate
Content-Type: application/json

{ "content": "meta {\\n  name: Get Users\\n  type: http\\n}\\n..." }

Response:
{
  "success": true,
  "valid": true,
  "errors": [],
  "warnings": []
}
\`\`\`

### Validate .bru File by Path
\`\`\`
POST /api/bruno/validate/file
Content-Type: application/json

{ "filePath": "/path/to/request.bru" }
\`\`\`

### Validate Entire Collection
\`\`\`
POST /api/bruno/validate/collection
Content-Type: application/json

{ "collectionPath": "/path/to/collection" }

Response:
{
  "success": true,
  "valid": true,
  "totalFiles": 10,
  "validFiles": 10,
  "invalidFiles": 0,
  "results": { "/path/file.bru": { "valid": true, "errors": [], "warnings": [] } }
}
\`\`\`

### Parse .bru to JSON
\`\`\`
POST /api/bruno/parse
Content-Type: application/json

{ "content": "meta {\\n  name: Get Users\\n}\\n..." }

Response:
{
  "success": true,
  "request": {
    "meta": { "name": "Get Users", "type": "http", "seq": 1 },
    "http": { "method": "GET", "url": "..." },
    "headers": [...],
    "body": {...}
  }
}
\`\`\`

## Types

\`\`\`typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
}

interface CollectionValidationResult {
  valid: boolean;
  collectionPath: string;
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  results: Record<string, ValidationResult>;
}
\`\`\`

## Notes
- Validation uses \`@usebruno/lang\` parser (Node.js only, not browser-safe)
- Errors include line/column for IDE integration
- Use \`{{ variableName }}\` for environment variable interpolation
`;

export interface CollectionHelpProps {
  className?: string;
}

export const CollectionHelp: React.FC<CollectionHelpProps> = ({ className }) => {
  const { theme } = useTheme();
  const [copiedButton, setCopiedButton] = useState<'bru' | 'validation' | null>(null);

  const handleCopy = useCallback((type: 'bru' | 'validation', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedButton(type);
    setTimeout(() => setCopiedButton(null), 2000);
  }, []);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px 16px',
        color: theme.colors.textMuted,
        fontSize: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header with logo */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingTop: '16px',
        }}
      >
        <img
          src={BRUNO_LOGO_URL}
          alt="Bruno"
          style={{
            width: '64px',
            height: '64px',
            marginBottom: '16px',
          }}
        />
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Bruno API Client
        </h3>
        <p style={{ margin: '0 0 20px 0', lineHeight: 1.6, maxWidth: '260px' }}>
          Open-source API client that stores requests as{' '}
          <code
            style={{
              background: theme.colors.muted,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
            }}
          >
            .bru
          </code>{' '}
          files for Git-based version control and collaboration.
        </p>
      </div>

      {/* Features */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <FeatureTag label="REST" theme={theme} />
        <FeatureTag label="GraphQL" theme={theme} />
        <FeatureTag label="gRPC" theme={theme} />
      </div>

      {/* Download link */}
      <a
        href="https://www.usebruno.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'center',
          gap: '4px',
          color: theme.colors.primary,
          fontSize: '12px',
          textDecoration: 'none',
        }}
      >
        Get Bruno <ExternalLink size={12} />
      </a>

      {/* Copy cards section */}
      <div
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
          color: theme.colors.textMuted,
        }}
      >
        Copy for AI
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <CopyCard
          label=".bru file format"
          description="Syntax and structure reference for creating Bruno request files"
          copied={copiedButton === 'bru'}
          onClick={() => handleCopy('bru', BRU_FILE_INFO)}
          theme={theme}
        />
        <CopyCard
          label="Validation API"
          description="REST endpoints and TypeScript types for the ADE validation service"
          copied={copiedButton === 'validation'}
          onClick={() => handleCopy('validation', VALIDATION_API_INFO)}
          theme={theme}
        />
      </div>
    </div>
  );
};

interface FeatureTagProps {
  label: string;
  theme: ReturnType<typeof useTheme>['theme'];
}

const FeatureTag: React.FC<FeatureTagProps> = ({ label, theme }) => (
  <span
    style={{
      padding: '4px 10px',
      background: theme.colors.muted,
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 500,
      color: theme.colors.text,
    }}
  >
    {label}
  </span>
);

interface CopyCardProps {
  label: string;
  description: string;
  copied: boolean;
  onClick: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}

const CopyCard: React.FC<CopyCardProps> = ({ label, description, copied, onClick, theme }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '14px',
      background: theme.colors.muted,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px',
      color: theme.colors.text,
      fontSize: '12px',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      transition: 'border-color 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = theme.colors.primary;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = theme.colors.border;
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 600, fontSize: '13px' }}>{label}</span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          background: copied ? theme.colors.success : theme.colors.background,
          color: copied ? theme.colors.textOnPrimary : theme.colors.textMuted,
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </div>
    </div>
    <div style={{ fontSize: '11px', lineHeight: 1.4, color: theme.colors.textMuted }}>
      {description}
    </div>
  </button>
);
