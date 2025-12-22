<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
</script>

<div class="flex h-screen w-full overflow-hidden bg-background text-foreground">
    <Sidebar />

    <main class="flex-1 flex flex-col h-full relative">
        <div class="flex h-full items-center justify-center text-muted-foreground">
            <p>Choose a note to view</p>
        </div>
    </main>
</div>
