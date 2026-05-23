<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import type { Category, Tag, ResourceItem } from '../types';
  import ResourceCard from './ResourceCard.svelte';

  export let categories: Category[] = [];
  export let tags: Tag[] = [];
  export let list: ResourceItem[] = [];

  let currentCategory = categories.length > 0 ? categories[0].id : 'all';
  let currentTag = 'all';
  let searchQuery = '';

  $: filteredTags = tags.filter(tag => tag.id === 'all' || currentCategory === 'all' || tag.categoryId === currentCategory);

  $: filteredList = list.filter(resource => {
    const matchCategory = currentCategory === 'all' || resource.categoryId === currentCategory;
    const matchTag = currentTag === 'all' || resource.tagId === currentTag;
    const matchSearch = searchQuery === '' || resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchTag && matchSearch;
  });

  function setCategory(id: string) {
    currentCategory = id;
    currentTag = 'all'; // Reset tag when category changes
  }

  function setTag(id: string) {
    currentTag = id;
  }
</script>

<div>
  <!-- Search Bar -->
  <div class="mb-10 max-w-xl mx-auto">
    <div class="relative group">
      <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none opacity-50 group-focus-within:opacity-100 group-focus-within:text-primary-500 transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>
      <input
        type="search"
        bind:value={searchQuery}
        class="block w-full py-3 pl-11 pr-4 text-sm text-gray-900 bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-gray-200/50 dark:border-white/5 rounded-full focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all outline-none shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] dark:text-white placeholder-gray-400"
        placeholder="搜索资源..."
        autocomplete="off"
      >
    </div>
  </div>

  <!-- Filter Pills: Categories (Level 1) -->
  <div class="mb-5">
    <div class="flex flex-wrap gap-2.5 justify-center">
      {#each categories as cat (cat.id)}
        <button
          class="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 border
          {currentCategory === cat.id
            ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20 hover:bg-primary-700'
            : 'bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-transparent hover:bg-white dark:hover:bg-white/10 shadow-sm'}"
          on:click={() => setCategory(cat.id)}
        >
          {cat.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Filter Pills: Tags (Level 2) -->
  <div class="mb-12">
    <div class="flex flex-wrap gap-2 justify-center min-h-[32px]">
      {#each filteredTags as tag (tag.id)}
        <button
          class="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 active:scale-95 border
          {currentTag === tag.id
            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/20'
            : 'bg-transparent text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-200'}"
          on:click={() => setTag(tag.id)}
        >
          {tag.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Resource Matrix Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {#each filteredList as resource (resource.id)}
      <div animate:flip={{ duration: 300 }} in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}>
        <ResourceCard {resource} />
      </div>
    {/each}
  </div>

  <!-- Empty State -->
  {#if filteredList.length === 0}
    <div in:fade={{ duration: 300 }} class="py-32 text-center">
      <div class="text-6xl mb-6 opacity-80">📭</div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">未找到相关资源</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">请尝试更换筛选条件或搜索关键词</p>
    </div>
  {/if}
</div>
