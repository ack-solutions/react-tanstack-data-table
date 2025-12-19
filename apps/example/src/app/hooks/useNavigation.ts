import { useEffect, useMemo, useState } from 'react';
import { NavNode } from '../../content/navigation';

const flattenItems = (nodes: NavNode[]): string[] => {
  const ids: string[] = [];
  const walk = (list: NavNode[]) => {
    list.forEach((node) => {
      if (node.type === 'item') {
        ids.push(node.id);
      }
      if (node.children) {
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return ids;
};

const collectExpandable = (nodes: NavNode[]): string[] => {
  const ids: string[] = [];
  const walk = (list: NavNode[]) => {
    list.forEach((node) => {
      if (node.children && node.children.length > 0) {
        ids.push(node.id);
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return ids;
};

export function useNavigation(navigationTree: NavNode[]) {
  const itemIds = useMemo(() => flattenItems(navigationTree), [navigationTree]);
  const expandableIds = useMemo(() => collectExpandable(navigationTree), [navigationTree]);

  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section && itemIds.includes(section)) {
        return section;
      }
    }
    return itemIds[0] ?? '';
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(expandableIds));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync active section with URL
  useEffect(() => {
    if (typeof window !== 'undefined' && activeSection) {
      const url = new URL(window.location.href);
      url.searchParams.set('section', activeSection);
      window.history.pushState({}, '', url);
    }
  }, [activeSection]);

  // Handle browser back/forward
  useEffect(() => {
    const handler = () => setActiveSection(getInitialSection());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    setMobileOpen(false);
  };

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return {
    activeSection,
    expanded,
    mobileOpen,
    itemIds,
    handleItemClick,
    handleToggleExpand,
    handleDrawerToggle,
  };
}
