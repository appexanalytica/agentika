import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Inbox, Send, Archive, Trash2, RefreshCw, Plus, Reply, Eye, EyeOff, X, Paperclip, Search, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { PageHeader, Badge } from "@/components/admin/ui-bits";
import { mailAPI } from "@/lib/api";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/admin/emails")({
  head: () => ({ meta: [{ title: "Correo | AGENTIKA Admin" }] }),
  component: EmailsPage,
});

interface Email {
  _id: string;
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  date: string;
  folder: string;
  read: boolean;
  direction: 'inbound' | 'outbound';
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  inReplyTo?: string;
  references?: string[];
  createdAt: string;
}

type Folder = 'inbox' | 'sent' | 'unread' | 'archive' | 'trash';

const folders = [
  { id: 'inbox' as Folder, label: 'Bandeja de entrada', icon: Inbox },
  { id: 'sent' as Folder, label: 'Enviados', icon: Send },
  { id: 'unread' as Folder, label: 'No leídos', icon: Mail },
  { id: 'archive' as Folder, label: 'Archivados', icon: Archive },
  { id: 'trash' as Folder, label: 'Papelera', icon: Trash2 },
];

function EmailsPage() {
  const [selectedFolder, setSelectedFolder] = useState<Folder>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeText, setComposeText] = useState('');
  const [composeHtml, setComposeHtml] = useState('');
  const [sending, setSending] = useState(false);

  const loadEmails = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedFolder === 'unread') {
        response = await mailAPI.getInbox({ unread: 'true' });
      } else if (selectedFolder === 'sent') {
        response = await mailAPI.getSent();
      } else {
        response = await mailAPI.getByFolder(selectedFolder);
      }
      setEmails(response.emails || []);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await mailAPI.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const syncEmails = async () => {
    setSyncing(true);
    try {
      await mailAPI.sync(50);
      await loadEmails();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error syncing emails:', error);
      alert('Error al sincronizar correos. Verifica la configuración del servidor.');
    } finally {
      setSyncing(false);
    }
  };

  const markAsRead = async (email: Email, read: boolean) => {
    try {
      await mailAPI.markAsRead(email._id, read);
      setEmails(emails.map(e => e._id === email._id ? { ...e, read } : e));
      if (selectedEmail?._id === email._id) {
        setSelectedEmail({ ...selectedEmail, read });
      }
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const deleteEmail = async (email: Email) => {
    try {
      await mailAPI.delete(email._id);
      setEmails(emails.filter(e => e._id !== email._id));
      if (selectedEmail?._id === email._id) {
        setSelectedEmail(null);
      }
      await loadUnreadCount();
    } catch (error) {
      console.error('Error deleting email:', error);
    }
  };

  const moveToFolder = async (email: Email, folder: string) => {
    try {
      await mailAPI.moveToFolder(email._id, folder);
      setEmails(emails.filter(e => e._id !== email._id));
      if (selectedEmail?._id === email._id) {
        setSelectedEmail(null);
      }
      await loadUnreadCount();
    } catch (error) {
      console.error('Error moving email:', error);
    }
  };

  const sendEmail = async () => {
    if (!composeTo || !composeSubject) {
      alert('Por favor completa el destinatario y el asunto.');
      return;
    }
    setSending(true);
    try {
      await mailAPI.send({
        to: composeTo,
        subject: composeSubject,
        text: composeText,
        html: composeHtml,
      });
      setComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeText('');
      setComposeHtml('');
      if (selectedFolder === 'sent') {
        await loadEmails();
      }
      alert('Correo enviado exitosamente.');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error al enviar el correo. Verifica la configuración SMTP.');
    } finally {
      setSending(false);
    }
  };

  const replyToEmail = async (email: Email, text: string, html: string) => {
    try {
      await mailAPI.reply(email._id, { text, html });
      alert('Respuesta enviada exitosamente.');
      if (selectedFolder === 'sent') {
        await loadEmails();
      }
    } catch (error) {
      console.error('Error replying to email:', error);
      alert('Error al enviar la respuesta.');
    }
  };

  useEffect(() => {
    loadEmails();
  }, [selectedFolder]);

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const filteredEmails = emails.filter(e =>
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.to.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <button
            onClick={() => setComposeOpen(true)}
            className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-glow transition flex items-center justify-center gap-2"
          >
            <Plus className="size-4" /> Nuevo correo
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const count = folder.id === 'unread' ? unreadCount : 0;
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  selectedFolder === folder.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="size-4" />
                <span className="flex-1 text-left">{folder.label}</span>
                {count > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-xs">{count}</Badge>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={syncEmails}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-muted transition disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
      </div>

      {/* Email List */}
      <div className="w-96 bg-muted/30 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar correos..."
              className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Cargando correos...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No hay correos en esta carpeta.</div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email._id}
                onClick={() => {
                  setSelectedEmail(email);
                  if (!email.read) markAsRead(email, true);
                }}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition ${
                  selectedEmail?._id === email._id ? 'bg-muted/50' : ''
                } ${!email.read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-2 rounded-full mt-2 flex-shrink-0 ${!email.read ? 'bg-primary' : 'bg-muted'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`font-medium text-sm truncate ${!email.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {email.direction === 'outbound' ? email.to[0] : email.from}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(email.date), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                    <p className={`text-sm truncate mb-1 ${!email.read ? 'font-medium' : ''}`}>{email.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{email.text || email.html?.replace(/<[^>]*>/g, '') || '(Sin contenido)'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Detail */}
      <div className="flex-1 flex flex-col bg-card">
        {selectedEmail ? (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 rounded-lg hover:bg-muted transition"
                >
                  <X className="size-4" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => markAsRead(selectedEmail, !selectedEmail.read)}
                    className="p-2 rounded-lg hover:bg-muted transition"
                    title={selectedEmail.read ? 'Marcar como no leído' : 'Marcar como leído'}
                  >
                    {selectedEmail.read ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <button
                    onClick={() => moveToFolder(selectedEmail, 'archive')}
                    className="p-2 rounded-lg hover:bg-muted transition"
                    title="Archivar"
                  >
                    <Archive className="size-4" />
                  </button>
                  <button
                    onClick={() => deleteEmail(selectedEmail)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition"
                    title="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {selectedEmail.direction === 'inbound' && (
                <button
                  onClick={() => {
                    setComposeTo(selectedEmail.from);
                    setComposeSubject(selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`);
                    setComposeOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-glow transition"
                >
                  <Reply className="size-4" /> Responder
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">{selectedEmail.subject}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    {format(new Date(selectedEmail.date), 'dd MMM yyyy, HH:mm', { locale: es })}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEmail.direction === 'outbound' ? <Send className="size-4" /> : <Mail className="size-4" />}
                    {selectedEmail.direction === 'outbound' ? `Para: ${selectedEmail.to.join(', ')}` : `De: ${selectedEmail.from}`}
                  </div>
                </div>
              </div>
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mb-4 p-3 bg-muted/30 border border-border rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Paperclip className="size-4" /> Adjuntos
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((att, idx) => (
                      <Badge key={idx} className="bg-accent/15 text-accent border-accent/30">
                        {att.filename} ({(att.size / 1024).toFixed(1)} KB)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedEmail.html || selectedEmail.text.replace(/\n/g, '<br/>') }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="size-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Selecciona un correo para verlo</p>
              <p className="text-sm mt-2">O crea uno nuevo con el botón "Nuevo correo"</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Nuevo correo</h2>
              <button onClick={() => setComposeOpen(false)} className="p-2 rounded-lg hover:bg-muted transition">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Para</label>
                <input
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="destinatario@ejemplo.com"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Asunto</label>
                <input
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Asunto del correo"
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Mensaje</label>
                <textarea
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={12}
                  className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setComposeOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground hover:bg-muted transition"
              >
                Cancelar
              </button>
              <button
                onClick={sendEmail}
                disabled={sending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary-glow transition disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="size-4" /> Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
