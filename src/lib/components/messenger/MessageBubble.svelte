<script lang="ts">
    import { type Message } from "$lib/db";
    import { cn } from "$lib/utils";

    let { message } = $props<{ message: Message }>();

    const timeStr = message.createdAt.toLocaleTimeString('uk-UA', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
</script>

<div class="flex w-full justify-end mb-2">
    <div class={cn(
        "relative max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm",
        "bg-primary text-primary-foreground",
        "rounded-br-none"
    )}>
        <p class="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        <div class="mt-1 flex items-center justify-end gap-1 opacity-70">
            {#if message.isEdited}
                <span class="text-[10px]">edited</span>
            {/if}
            <span class="text-[10px] tabular-nums">{timeStr}</span>
        </div>
    </div>
</div>
