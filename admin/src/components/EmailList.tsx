import { Email } from '@/hooks/useAPI';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MailOpen, Mail, Paperclip } from 'lucide-react';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onEmailSelect: (email: Email) => void;
  onEmailDelete: (id: string) => void;
}

export function EmailList({ emails, selectedEmailId, onEmailSelect, onEmailDelete }: EmailListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Mail className="size-12 mb-4 opacity-50" />
          <p>No hay correos en esta carpeta</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {emails.map((email) => (
            <li
              key={email._id}
              onClick={() => onEmailSelect(email)}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedEmailId === email._id ? 'bg-muted' : ''
              } ${!email.read ? 'bg-primary/5' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!email.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <span className={`font-medium truncate ${!email.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {email.from}
                      </span>
                    </div>
                    <p className={`text-sm truncate mb-1 ${!email.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {email.text?.substring(0, 100) || 'Sin contenido'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(email.date), { addSuffix: true, locale: es })}
                    </span>
                    {email.attachments.length > 0 && (
                      <Paperclip className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
