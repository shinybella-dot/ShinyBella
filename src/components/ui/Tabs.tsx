'use client';

import * as React from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ defaultValue, children, onValueChange, className }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);
  
  const contextValue = React.useMemo(
    () => ({ value, onValueChange: (v: string) => { setValue(v); onValueChange?.(v); } }),
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

const TabsContext = React.createContext<{ value: string; onValueChange: (v: string) => void } | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('Tabs compounds must be used within Tabs');
  return context;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
export function TabsList({ children, ...props }: TabsListProps) {
  return <div {...props} className="flex border-b border-warm-steel/20 mb-4" role="tablist">{children}</div>;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
export function TabsTrigger({ value, children, ...props }: TabsTriggerProps) {
  const { value: currentValue, onValueChange } = useTabs();
  const isActive = currentValue === value;
  
  return (
    <button
      {...props}
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors border-b-2 ${
        isActive ? 'border-accent text-accent' : 'border-transparent text-warm-steel/60 hover:text-concrete'
      }`}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}
export function TabsContent({ value, children, ...props }: TabsContentProps) {
  const { value: currentValue } = useTabs();
  if (currentValue !== value) return null;
  return <div {...props} role="tabpanel">{children}</div>;
}