<script lang="ts">
  import { fade } from 'svelte/transition';
  import { searchQueryStore } from '../store';
  import Icon from '@iconify/svelte';

  let searchOpen = $state(false);
  let localQuery = $state('');

  // Create a timeout reference
  let timeout: ReturnType<typeof setTimeout>;

  // Synchronize local input to global store with a debounce
  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    localQuery = value;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      searchQueryStore.set(value);
    }, 200);
  }

  function toggleSearch() {
    searchOpen = !searchOpen;
    if (!searchOpen) {
      localQuery = '';
      searchQueryStore.set('');
    }
  }

  // Action to autofocus the input when it mounts
  function autofocus(node: HTMLInputElement) {
    node.focus();
  }
</script>

<!-- The trigger button in the nav -->
<button
  class="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all duration-300 flex items-center justify-center"
  aria-label="Toggle Search"
  onclick={toggleSearch}
>
  <Icon icon="lucide:search" class="w-5 h-5" />
</button>

<!-- Absolute masking layer over the nav -->
{#if searchOpen}
  <div
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150 }}
    class="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg flex items-center px-4 sm:px-6 lg:px-8 z-50 shadow-sm"
  >
    <div class="relative flex items-center w-full max-w-[75rem] mx-auto h-full">
      <Icon icon="lucide:search" class="absolute left-0 w-5 h-5 text-zinc-400" />
      <input
        use:autofocus
        type="search"
        value={localQuery}
        oninput={handleInput}
        placeholder="搜索资源..."
        class="block w-full h-full bg-transparent pl-10 pr-10 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none"
        autocomplete="off"
      />
      <button
        class="absolute right-0 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        onclick={toggleSearch}
      >
        <Icon icon="lucide:x" class="w-5 h-5" />
      </button>
    </div>
  </div>
{/if}
