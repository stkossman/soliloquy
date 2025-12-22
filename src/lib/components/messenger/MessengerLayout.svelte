<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import ChatWindow from "./ChatWindow.svelte";

    let activeChatId = $state<number | null>(null);
</script>

<div class="flex h-screen w-full overflow-hidden bg-background text-foreground">
    <Sidebar bind:activeChatId />

    <main class="flex-1 flex flex-col h-full relative">
        {#if activeChatId !== null}
            {#key activeChatId}
                <ChatWindow {activeChatId} />
            {/key}
        {:else}
            <div class="flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
                <div class="bg-muted/20 p-4 rounded-full">
                    <span class="text-4xl">📝</span>
                </div>
                <p>Choose a chat to view</p>
            </div>
        {/if}
    </main>
</div>
