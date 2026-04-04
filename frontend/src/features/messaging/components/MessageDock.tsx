import { useMessagingOptional } from "../context/MessagingContext";
import { useChatActions } from "../hooks/useChatActions";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { DockChatPanel } from "./DockChatPanel";
import { DockAvatarStrip } from "./DockAvatarStrip";

/**
 * Floating chat dock anchored to the bottom-right corner.
 * Composes DockChatPanel (per open conversation) and DockAvatarStrip (avatar bubbles + FAB).
 */
export function MessageDock() {
    const { user } = useAuthSession();
    const messaging = useMessagingOptional();

    const { handleSend, handleAttachImage, isSending } = useChatActions({
        sendMessage: messaging?.sendMessage ?? (async () => { throw new Error("No messaging"); }),
    });

    if (!user || !messaging) return null;

    const {
        conversations,
        messageThreads,
        dockOpenIds,
        dockAvatarIds,
        dockExpanded,
        setDockExpanded,
        minimizeDockChat,
        closeDockChat,
        toggleDockPanel,
        loadMessagesForConversation,
    } = messaging;

    return (
        <div className="fixed bottom-4 right-4 z-40 flex max-w-[100vw] flex-row items-end gap-3 pl-2">
            {/* Chat panels — left of the avatar column */}
            {dockExpanded && dockOpenIds.length > 0 && (
                <div className="flex flex-row items-end gap-2">
                    {dockOpenIds.map((id) => (
                        <DockChatPanel
                            key={id}
                            conversationId={id}
                            conversation={conversations.find((c) => c.id === id)}
                            messages={messageThreads[id] ?? []}
                            currentUserId={user.id}
                            isSending={isSending(id)}
                            onSend={handleSend}
                            onAttachImage={handleAttachImage}
                            onMinimize={minimizeDockChat}
                            onClose={closeDockChat}
                            onOpenInMessenger={loadMessagesForConversation}
                        />
                    ))}
                </div>
            )}

            {/* Avatars column + FAB — right edge */}
            <DockAvatarStrip
                conversations={conversations}
                dockAvatarIds={dockAvatarIds}
                dockOpenIds={dockOpenIds}
                dockExpanded={dockExpanded}
                onTogglePanel={toggleDockPanel}
                onToggleExpanded={() => setDockExpanded((v) => !v)}
            />
        </div>
    );
}
