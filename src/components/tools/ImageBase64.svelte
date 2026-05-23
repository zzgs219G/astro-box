<script lang="ts">
  let dropzone = $state<HTMLElement | null>(null);
  let fileInput = $state<HTMLInputElement | null>(null);
  
  // 核心状态响应式
  let workspaceOpen = $state(false);
  let base64Result = $state('');
  let currentFileName = $state('image');
  let isDragOver = $state(false);
  let copyText = $state('复制到剪贴板');

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    currentFileName = file.name.replace(/\.[^/.]+$/, "");
    workspaceOpen = true;

    const reader = new FileReader();
    reader.onload = (e) => {
      base64Result = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) handleFile(file);
  }

  function copyToClipboard() {
    if (!base64Result) return;
    navigator.clipboard.writeText(base64Result).then(() => {
      copyText = '已复制!';
      setTimeout(() => {
        copyText = '复制到剪贴板';
      }, 2000);
    });
  }

  function downloadAsTxt() {
    if (!base64Result) return;
    const blob = new Blob([base64Result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFileName}_base64.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="max-w-4xl mx-auto py-12 px-4">
  <div class="text-center mb-10">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">📋 图片转 Base64</h1>
    <p class="text-gray-500 dark:text-gray-400">上传图片输出 Base64 字符串，支持复制和下载</p>
  </div>

  <div class="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-[1.25rem] p-8 border border-gray-200/50 dark:border-zinc-800/50 shadow-sm">
    <div
      bind:this={dropzone}
      onclick={() => fileInput?.click()}
      ondragover={(e) => { e.preventDefault(); isDragOver = true; }}
      ondragleave={(e) => { e.preventDefault(); isDragOver = false; }}
      ondrop={handleDrop}
      class="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors duration-300
        {workspaceOpen ? 'hidden' : ''}
        {isDragOver 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' 
          : 'border-gray-300 dark:border-zinc-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10'}"
    >
      <div class="text-4xl mb-4">📤</div>
      <p class="text-gray-600 dark:text-gray-300 font-medium">点击或拖拽上传图片文件</p>
    </div>

    <input 
      bind:this={fileInput} 
      type="file" 
      accept="image/*" 
      class="hidden" 
      onchange={handleInputChange} 
    />

    {#if workspaceOpen}
      <div class="mt-8 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Base64 结果</h3>
          <span class="text-xs text-gray-400 dark:text-gray-500">长度: {base64Result.length}</span>
        </div>
        <textarea
          readonly
          value={base64Result}
          class="w-full h-48 p-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none break-all"
        ></textarea>
        
        <div class="flex flex-wrap gap-4 justify-center pt-4">
          <button 
            onclick={copyToClipboard}
            class="px-8 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors duration-300 shadow-sm"
          >
            {copyText}
          </button>
          <button 
            onclick={downloadAsTxt}
            class="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors duration-300 shadow-sm"
          >
            下载为 .txt
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>