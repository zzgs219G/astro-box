<script lang="ts">
  import type { ResourceItem } from '../types';
  import Icon from '@iconify/svelte';

  let { resource } = $props<{ resource: ResourceItem }>();



  // Determine emoji based on file title
  let lowerTitle = $derived(resource.title.toLowerCase());
  let emoji = $derived((() => {
    if (lowerTitle.endsWith('.apk')) return '📱';
    if (lowerTitle.endsWith('.zip') || lowerTitle.endsWith('.rar') || lowerTitle.endsWith('.7z')) return '📦';
    if (lowerTitle.endsWith('.mp4') || lowerTitle.endsWith('.avi') || lowerTitle.endsWith('.mkv')) return '🎬';
    if (lowerTitle.endsWith('.mp3') || lowerTitle.endsWith('.flac')) return '🎵';
    if (lowerTitle.endsWith('.jpg') || lowerTitle.endsWith('.png') || lowerTitle.endsWith('.gif')) return '🖼️';
    if (lowerTitle.endsWith('.pdf') || lowerTitle.endsWith('.doc') || lowerTitle.endsWith('.docx') || lowerTitle.endsWith('.txt')) return '📚';
    if (!resource.title.includes('.')) return '📁'; // Rough heuristic for folders
    return '📄';
  })());

  // Parse description string to get cleaner info
  let parts = $derived(resource.description.split('|'));
  let size = $derived(parts.length === 2 ? parts[0].replace('大小:', '').trim() : resource.description);
  let time = $derived(parts.length === 2 ? parts[1].replace('更新时间:', '').trim() : '');

  let imgError = $state(false);
</script>

<div class="resource-card group flex flex-col bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-[1.25rem] p-6 border border-gray-200/50 dark:border-zinc-800/50 shadow-sm transition-all duration-300">
  <div class="flex items-start space-x-4 mb-5">
    <div class="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50/80 dark:bg-zinc-800/50 text-2xl overflow-hidden transition-transform duration-500 group-hover:opacity-80">
      {#if resource.iconUrl && !imgError}
        <img src={resource.iconUrl} alt="icon" class="w-full h-full object-cover" onerror={() => imgError = true} />
      {:else}
        <span class="opacity-80">{emoji}</span>
      {/if}
    </div>
    <div class="flex-1 min-w-0 pt-1">
      <h3 class="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300" title={resource.title}>
        {resource.title}
      </h3>
      <div class="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400/80 font-medium">
        {#if size}
          <span>{size}</span>
        {/if}
        {#if size && time}
          <span class="text-gray-300 dark:text-gray-600">•</span>
        {/if}
        {#if time}
          <span>{time}</span>
        {/if}
      </div>
    </div>
  </div>

  <div class="mt-auto pt-2">
    {#if resource.categoryId === 'toolbox'}
      <a
        href={resource.lanzaoUrl}
        class="flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-all duration-300"
      >
        运行工具
        <Icon icon="lucide:play" class="w-3.5 h-3.5 ml-1.5 opacity-70 transition-all duration-300 group-hover:opacity-100" />
      </a>
    {:else}
      <a
        href={resource.lanzaoUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-all duration-300 "
      >
        直达资源
        <Icon icon="lucide:arrow-right" class="w-3.5 h-3.5 ml-1.5 opacity-70 transition-all duration-300 group-hover:opacity-100" />
      </a>
    {/if}
  </div>
</div>
