import { useState } from 'react';
import { X, Send, Paperclip } from 'lucide-react';

interface ComposeEmailProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { to: string; subject: string; text: string; html: string }) => Promise<void>;
  replyTo?: {
    to: string;
    subject: string;
  };
}

export function ComposeEmail({ isOpen, onClose, onSend, replyTo }: ComposeEmailProps) {
  const [to, setTo] = useState(replyTo?.to || '');
  const [subject, setSubject] = useState(replyTo?.subject || '');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject) return;

    setSending(true);
    try {
      await onSend({
        to,
        subject,
        text,
        html: text.replace(/\n/g, '<br>'),
      });
      onClose();
      setTo('');
      setSubject('');
      setText('');
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {replyTo ? 'Responder correo' : 'Nuevo correo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label htmlFor="to" className="block text-sm font-medium mb-1">
                Para
              </label>
              <input
                id="to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">
                Asunto
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Asunto del correo"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Mensaje
              </label>
              <textarea
                id="message"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={12}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
          </div>

          <div className="p-4 border-t border-border flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Paperclip className="size-4" />
              Adjuntar archivo
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending || !to || !subject}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="size-4" />
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
