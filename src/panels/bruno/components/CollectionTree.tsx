import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useTheme, type Theme } from '@principal-ade/industry-theme';
import type { CollectionItem } from '../hooks/useBrunoCollection';

export interface CollectionTreeProps {
  items: CollectionItem[];
  selectedItem: CollectionItem | null;
  onSelectItem: (item: CollectionItem) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  DELETE: '#f93e3e',
  PATCH: '#50e3c2',
  HEAD: '#9012fe',
  OPTIONS: '#0d5aa7',
};

interface TreeItemProps {
  item: CollectionItem;
  depth: number;
  selectedItem: CollectionItem | null;
  onSelectItem: (item: CollectionItem) => void;
  theme: Theme;
}

const TreeItem: React.FC<TreeItemProps> = ({ item, depth, selectedItem, onSelectItem, theme }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = selectedItem?.uid === item.uid;
  const isFolder = item.type === 'folder';

  const method = (item.request as { http?: { method?: string } })?.http?.method?.toUpperCase() || 'GET';
  const methodColor = METHOD_COLORS[method] || METHOD_COLORS.GET;

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onSelectItem(item);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          paddingLeft: `${8 + depth * 16}px`,
          cursor: 'pointer',
          background: isSelected ? theme.colors.backgroundSecondary : 'transparent',
          borderRadius: '4px',
          fontSize: '13px',
          color: theme.colors.text,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = theme.colors.backgroundHover;
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown size={14} color={theme.colors.textMuted} />
            ) : (
              <ChevronRight size={14} color={theme.colors.textMuted} />
            )}
            <Folder size={14} color={theme.colors.textMuted} />
          </>
        ) : (
          <>
            <span style={{ width: '14px' }} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: methodColor,
                minWidth: '36px',
              }}
            >
              {method}
            </span>
          </>
        )}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </span>
      </div>

      {isFolder && isExpanded && item.items && (
        <div>
          {item.items.map((child) => (
            <TreeItem
              key={child.uid}
              item={child}
              depth={depth + 1}
              selectedItem={selectedItem}
              onSelectItem={onSelectItem}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CollectionTree: React.FC<CollectionTreeProps> = ({
  items,
  selectedItem,
  onSelectItem,
}) => {
  const { theme } = useTheme();

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: theme.colors.textMuted,
          fontSize: '13px',
        }}
      >
        No requests found
      </div>
    );
  }

  return (
    <div style={{ padding: '8px' }}>
      {items.map((item) => (
        <TreeItem
          key={item.uid}
          item={item}
          depth={0}
          selectedItem={selectedItem}
          onSelectItem={onSelectItem}
          theme={theme}
        />
      ))}
    </div>
  );
};
