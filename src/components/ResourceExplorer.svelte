<script lang="ts">
    import { fade } from 'svelte/transition';
  import type { Category, Tag, ResourceItem } from '../types';
  import ResourceCard from './ResourceCard.svelte';
  import { searchQueryStore } from '../store';

  let { categories = [], tags = [], list = [] } = $props<{
    categories: Category[];
    tags: Tag[];
    list: ResourceItem[];
  }>();

  let currentCategory = $state('toolbox');
  let currentTag = $state('all');
  let searchQuery = $state('');
  searchQueryStore.subscribe(value => {
    searchQuery = value;
  });

  let filteredTags = $derived(
    tags.filter(tag => tag.id === 'all' || currentCategory === 'all' || tag.categoryId === currentCategory)
  );

  let filteredList = $derived(
    list.filter(resource => {
      const matchCategory = currentCategory === 'all' || resource.categoryId === currentCategory;
      const matchTag = currentTag === 'all' || resource.tagId === currentTag;
      const matchSearch = searchQuery === '' || resource.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchTag && matchSearch;
    })
  );

  function setCategory(id: string) {
    currentCategory = id;
    currentTag = 'all'; // Reset tag when category changes
  }

  function setTag(id: string) {
    currentTag = id;
  }
</script>

<div>
  <!-- Filter Pills: Categories (Level 1) -->
  <div class="mb-5">
    <div class="flex flex-wrap gap-2.5 justify-center">
      {#each categories as cat (cat.id)}
        <button
          class="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border
          {currentCategory === cat.id
            ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/20 hover:bg-primary-700'
            : 'bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-transparent hover:bg-white dark:hover:bg-white/10 shadow-sm'}"
          onclick={() => setCategory(cat.id)}
        >
          {cat.name}
        </button>
      {/each}
    </div>
  </div>

  {#if currentCategory !== 'toolbox'}
  <!-- Filter Pills: Tags (Level 2) -->
  <div class="mb-12">
    <div class="flex flex-wrap gap-2 justify-center min-h-[32px]">
      {#each filteredTags as tag (tag.id)}
        <button
          class="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border
          {currentTag === tag.id
            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/20'
            : 'bg-transparent text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-200'}"
          onclick={() => setTag(tag.id)}
        >
          {tag.name}
        </button>
      {/each}
    </div>
  </div>
  {/if}

  <!-- Resource Matrix Grid (Macro Transition) -->
  {#key `${currentCategory}-${currentTag}`}
    <div in:fade={{ duration: 250, delay: 100 }} out:fade={{ duration: 100 }} class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[500px]" style="content-visibility: auto;">
      {#if filteredList.length > 0}
        {#each filteredList as resource (resource.id)}
          <ResourceCard {resource} />
        {/each}
      {:else}
        <!-- Empty State -->
        <div class="col-span-full py-32 text-center flex flex-col items-center justify-center">
          <div class="text-6xl mb-6 opacity-80">📭</div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">未找到相关资源</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">请尝试更换筛选条件或搜索关键词</p>
        </div>
      {/if}
    </div>
  {/key}
</div>
