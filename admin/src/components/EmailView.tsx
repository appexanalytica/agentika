import { Email } from '@/hooks/useAPI';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Reply, Trash2, Archive, Paperclip, X } from 'lucide-react';

interface EmailViewProps {
  email: Email | null;
  onReply: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onClose: () => void;
}

export function EmailView({ email, onReply, onDelete, onArchive, onClose }: EmailViewProps) {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Selecciona un correo para verlo</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold truncate flex-1">{email.subject}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-semibold text-lg">{email.from}</p>
              <p className="text-sm text-muted-foreground">Para: {email.to.join(', ')}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(email.date), 'PPP p', { locale: es })}
            </p>
          </div>

          {email.attachments.length > 0 && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Paperclip className="size-4" />
                Adjuntos ({email.attachments.length})
              </div>
              <ul className="space-y-1">
                {email.attachments.map((att, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {att.filename} ({(att.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="prose prose-sm max-w-none">
          {email.html ? (
            <div dangerouslySetInnerHTML={{ __html: email.html }} />
          ) : (
            <p className="whitespace-pre-wrap">{email.text}</p>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border flex items-center gap-2">
        <button
          onClick={onReply}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Reply className="size-4" />
          Responder
        </button>
        <button
          onClick={onArchive}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Archive className="size-4" />
          Archivar
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors ml-auto"
        >
          <Trash2 className="size-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
