<script lang="ts">
    import { liveQuery } from "dexie";
    import { db, type Chat } from "$lib/db";
    import { formatChatDate } from "$lib/utils";

    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Separator } from "$lib/components/ui/separator";
    import * as Avatar from "$lib/components/ui/avatar";

    import Search from "lucide-svelte/icons/search";
    import Plus from "lucide-svelte/icons/plus";
    import Pin from "lucide-svelte/icons/pin";
    import MessageSquare from "lucide-svelte/icons/message-square";

    let searchQuery = $state("");
    let chats = $state<Chat[]>([]);
    let activeChatId = $state<number | null>(null);

    $effect(() => {
        const subscription = liveQuery(async () => {
            let collection = db.chats.orderBy("lastModified").reverse();
            
            if (searchQuery.trim()) {
                const lowerQuery = searchQuery.toLowerCase();
                return collection.filter(chat => chat.title.toLowerCase().includes(lowerQuery)).toArray();
            }
            
            return collection.toArray();
        }).subscribe((data) => {
            chats = data;
        });

        return () => subscription.unsubscribe();
    });

    async function createNewChat() {
        const id = await db.chats.add({
            title: "New Chat",
            isPinned: false,
            createdAt: new Date(),
            lastModified: new Date()
        });
        activeChatId = id as number;
    }
</script>

<div class="flex h-full w-[320px] flex-col border-r bg-background">
    <div class="p-4 space-y-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <Avatar.Root class="h-9 w-9">
                    <Avatar.Image src="https://github.com/shadcn.png" alt="@stkossman" />
                    <Avatar.Fallback>SK</Avatar.Fallback>
                </Avatar.Root>
                <div class="flex flex-col">
                    <span class="text-sm font-semibold">Soliloquy</span>
                    <span class="text-xs text-muted-foreground">Local Storage</span>
                </div>
            </div>
            <Button variant="ghost" size="icon" onclick={createNewChat}>
                <Plus class="h-5 w-5" />
            </Button>
        </div>

        <div class="relative">
            <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search..." 
                class="pl-8" 
                bind:value={searchQuery}
            />
        </div>
    </div>

    <Separator />

    <ScrollArea class="flex-1">
        <div class="flex flex-col gap-1 p-2">
            {#each chats as chat (chat.id)}
                <button
                    class="flex flex-col items-start gap-1 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent 
                    {activeChatId === chat.id ? 'bg-accent' : ''}"
                    onclick={() => activeChatId = chat.id!}
                >
                    <div class="flex w-full items-center justify-between">
                        <span class="font-semibold truncate w-[180px]">
                            {chat.title}
                        </span>
                        <span class="text-xs text-muted-foreground tabular-nums">
                            {formatChatDate(chat.lastModified)}
                        </span>
                    </div>

                    <div class="flex w-full items-center justify-between text-muted-foreground">
                        <span class="truncate text-xs w-[200px]">
                             No preview available
                        </span>
                        {#if chat.isPinned}
                            <Pin class="h-3 w-3 rotate-45" />
                        {/if}
                    </div>
                </button>
            {:else}
                <div class="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <MessageSquare class="mb-2 h-10 w-10 opacity-20" />
                    <p class="text-sm">No notes</p>
                </div>
            {/each}
        </div>
    </ScrollArea>
</div>
