import { Inbox, Send, Archive, Trash, FileText, RefreshCw } from 'lucide-react';

interface EmailSidebarProps {
  activeFolder: string;
  onFolderChange: (folder: string) => void;
  unreadCount: number;
  onSync: () => void;
  isSyncing: boolean;
}

const folders = [
  { id: 'inbox', name: 'Bandeja de entrada', icon: Inbox },
  { id: 'sent', name: 'Enviados', icon: Send },
  { id: 'drafts', name: 'Borradores', icon: FileText },
  { id: 'archive', name: 'Archivados', icon: Archive },
  { id: 'trash', name: 'Papelera', icon: Trash },
];

export function EmailSidebar({
  activeFolder,
  onFolderChange,
  unreadCount,
  onSync,
  isSyncing,
}: EmailSidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isActive = activeFolder === folder.id;
            const count = folder.id === 'inbox' ? unreadCount : 0;

            return (
              <li key={folder.id}>
                <button
                  onClick={() => onFolderChange(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4" />
                    <span className="text-sm font-medium">{folder.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
