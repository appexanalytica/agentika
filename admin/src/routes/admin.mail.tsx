import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Email, emailAPI } from '@/hooks/useAPI';
import { EmailSidebar } from '@/components/EmailSidebar';
import { EmailList } from '@/components/EmailList';
import { EmailView } from '@/components/EmailView';
import { ComposeEmail } from '@/components/ComposeEmail';

export const Route = createFileRoute('/admin/mail')({
  head: () => ({ meta: [{ title: 'Correo | AGENTIKA Admin' }] }),
  component: MailPage,
});

function MailPage() {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ to: string; subject: string } | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const loadEmails = async () => {
    try {
      setLoading(true);
      let response;
      if (activeFolder === 'inbox') {
        response = await emailAPI.getInbox(1, 50);
      } else if (activeFolder === 'sent') {
        response = await emailAPI.getSent(1, 50);
      } else {
        response = await emailAPI.getByFolder(activeFolder, 1, 50);
      }
      setEmails(response.emails);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await emailAPI.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  useEffect(() => {
    loadEmails();
    loadUnreadCount();
  }, [activeFolder]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await emailAPI.syncEmails(50);
      await loadEmails();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error syncing emails:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEmailSelect = async (email: Email) => {
    setSelectedEmail(email);
    if (!email.read) {
      try {
        await emailAPI.markAsRead(email._id, true);
        await loadEmails();
        await loadUnreadCount();
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleSend = async (data: { to: string; subject: string; text: string; html: string }) => {
    await emailAPI.sendEmail(data);
    await loadEmails();
  };

  const handleReply = async () => {
    if (!selectedEmail) return;
    setReplyTo({
      to: selectedEmail.from,
      subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
    });
    setIsComposeOpen(true);
  };

  const handleReplySend = async (data: { to: string; subject: string; text: string; html: string }) => {
    await emailAPI.replyEmail(selectedEmail!._id, data);
    setIsComposeOpen(false);
    setReplyTo(undefined);
    await loadEmails();
  };

  const handleDelete = async () => {
    if (!selectedEmail) return;
    await emailAPI.deleteEmail(selectedEmail._id);
    setSelectedEmail(null);
    await loadEmails();
  };

  const handleArchive = async () => {
    if (!selectedEmail) return;
    await emailAPI.moveToFolder(selectedEmail._id, 'archive');
    setSelectedEmail(null);
    await loadEmails();
  };

  return (
    <div className="flex h-screen bg-background">
      <EmailSidebar
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        unreadCount={unreadCount}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-semibold">Correo</h1>
          <button
            onClick={() => {
              setReplyTo(undefined);
              setIsComposeOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" />
            Nuevo correo
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-96 border-r border-border flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Cargando...
              </div>
            ) : (
              <EmailList
                emails={emails}
                selectedEmailId={selectedEmail?._id || null}
                onEmailSelect={handleEmailSelect}
                onEmailDelete={handleDelete}
              />
            )}
          </div>

          <EmailView
            email={selectedEmail}
            onReply={handleReply}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onClose={() => setSelectedEmail(null)}
          />
        </div>
      </div>

      <ComposeEmail
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setReplyTo(undefined);
        }}
        onSend={replyTo ? handleReplySend : handleSend}
        replyTo={replyTo}
      />
    </div>
  );
}
