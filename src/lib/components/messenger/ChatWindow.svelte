<script lang="ts">
    import { liveQuery } from "dexie";
    import { db, type Chat, type Message } from "$lib/db";
    import MessageBubble from "./MessageBubble.svelte";

    import { Button } from "$lib/components/ui/button";
    import { Textarea } from "$lib/components/ui/textarea";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Separator } from "$lib/components/ui/separator";
    import * as Avatar from "$lib/components/ui/avatar";

    import Send from "lucide-svelte/icons/send";
    import MoreVertical from "lucide-svelte/icons/more-vertical";

    let { activeChatId } = $props<{ activeChatId: number }>();

    let inputValue = $state("");
    let messages = $state<Message[]>([]);
    let currentChat = $state<Chat | undefined>(undefined);
    let scrollViewport: HTMLElement;

    $effect(() => {
        db.chats.get(activeChatId).then(chat => {
            currentChat = chat;
        });
    });

    $effect(() => {
        const sub = liveQuery(() => {
            return db.messages
                .where("chatId")
                .equals(activeChatId)
                .sortBy("createdAt");
        }).subscribe(data => {
            messages = data;
            setTimeout(() => scrollToBottom(), 50);
        });

        return () => sub.unsubscribe();
    });

    function scrollToBottom() {
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }

    async function sendMessage() {
        if (!inputValue.trim()) return;

        const text = inputValue.trim();
        inputValue = "";

        await db.transaction('rw', db.chats, db.messages, async () => {
            await db.messages.add({
                chatId: activeChatId,
                content: text,
                createdAt: new Date(),
                isEdited: false
            });

            await db.chats.update(activeChatId, {
                lastModified: new Date()
            });
        });

    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
</script>

<div class="flex h-full flex-col">
    <div class="flex h-16 items-center justify-between border-b px-6 py-4">
        <div class="flex items-center gap-3">
            <Avatar.Root class="h-9 w-9">
                <Avatar.Fallback class="bg-muted text-muted-foreground">
                    {currentChat?.title.slice(0, 2).toUpperCase() ?? "??"}
                </Avatar.Fallback>
            </Avatar.Root>
            <div>
                <h2 class="text-sm font-semibold">{currentChat?.title ?? "Loading..."}</h2>
                <p class="text-xs text-muted-foreground">
                    {messages.length} messages
                </p>
            </div>
        </div>
        <Button variant="ghost" size="icon">
            <MoreVertical class="h-5 w-5" />
        </Button>
    </div>

    <div 
        class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        bind:this={scrollViewport}
    >
        {#each messages as msg (msg.id)}
            <MessageBubble message={msg} />
        {/each}
        
        {#if messages.length === 0}
            <div class="flex h-full items-center justify-center opacity-20">
                <span class="text-sm">It's empty here...</span>
            </div>
        {/if}
    </div>

    <div class="border-t p-4 bg-background">
        <div class="flex items-end gap-2 rounded-xl border bg-muted/30 p-2 focus-within:ring-1 focus-within:ring-ring">
            <Textarea
                bind:value={inputValue}
                onkeydown={handleKeydown}
                placeholder="Write a note..."
                class="min-h-[20px] max-h-[200px] w-full resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
                rows={1}
            />
            <Button size="icon" onclick={sendMessage} class="mb-1 h-8 w-8 shrink-0 rounded-full">
                <Send class="h-4 w-4" />
                <span class="sr-only">Send</span>
            </Button>
        </div>
    </div>
</div>
