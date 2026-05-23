<script lang="ts">
  let workspaceOpen = $state(false);
  let originalFile = $state<File | null>(null);
  let originalUrl = $state('');
  let compressedUrl = $state('');
  let compressedBlob = $state<Blob | null>(null);
  
  let originalSizeText = $state('');
  let compressedSizeText = $state('');
  let quality = $state(0.8);
  let isDragOver = $state(false);

  function formatSize(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function handleFile(file: File) {
    if (!file.type.match(/image\/(jpeg|png)/)) {
      alert('仅支持 JPG 和 PNG 格式');
      return;
    }
    originalFile = file;
    workspaceOpen = true;
    
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    originalUrl = URL.createObjectURL(file);
    originalSizeText = formatSize(file.size);
    compress();
  }

  function compress() {
    if (!originalFile || !originalUrl) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      if (originalFile.type === 'image/jpeg') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      
      const mimeType = originalFile.type;
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          compressedBlob = blob;
          if (compressedUrl) URL.revokeObjectURL(compressedUrl);
          compressedUrl = URL.createObjectURL(blob);
          compressedSizeText = formatSize(blob.size);
        },
        mimeType,
        mimeType === 'image/png' ? undefined : quality
      );
    };
    img.src = originalUrl;
  }

  $effect(() => {
    if (quality) compress();
  });
</script>

<div class="max-w-4xl mx-auto py-12 px-4">
  <div class="text-center mb-10">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">🖼️ 图片压缩</h1>
    <p class="text-gray-500 dark:text-gray-400">调节质量滑块，本地压缩 JPG/PNG，安全不上传</p>
  </div>

  <div class="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-[1.25rem] p-8 border border-gray-200/50 dark:border-zinc-800/50 shadow-sm">
    <input type="file" id="fileInput" accept="image/jpeg, image/png" class="hidden" onchange={(e) => handleFile((e.target as HTMLInputElement).files?.[0]!)} />
    
    <div
      onclick={() => document.getElementById('fileInput')?.click()}
      ondragover={(e) => { e.preventDefault(); isDragOver = true; }}
      ondragleave={(e) => { e.preventDefault(); isDragOver = false; }}
      ondrop={(e) => { e.preventDefault(); isDragOver = false; const file = e.dataTransfer?.files[0]; if (file) handleFile(file); }}
      class="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors duration-300
        {workspaceOpen ? 'hidden' : ''}
        {isDragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-300 dark:border-zinc-700 hover:border-primary-500 hover:bg-primary-50'}"
    >
      <div class="text-4xl mb-4">📤</div>
      <p class="text-gray-600 dark:text-gray-300 font-medium">点击或拖拽上传 JPG/PNG 图片</p>
    </div>

    {#if workspaceOpen}
      <div class="mt-8 space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">原始图片 <span class="text-gray-900 dark:text-white font-bold ml-2">{originalSizeText}</span></h3>
            <div class="bg-gray-100 dark:bg-zinc-800 rounded-lg p-2 aspect-video flex items-center justify-center overflow-hidden">
              <img src={originalUrl} alt="原始" class="max-w-full max-h-full object-contain" />
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">压缩后 <span class="text-primary-600 dark:text-primary-400 font-bold ml-2">{compressedSizeText}</span></h3>
            <div class="bg-gray-100 dark:bg-zinc-800 rounded-lg p-2 aspect-video flex items-center justify-center overflow-hidden">
              <img src={compressedUrl} alt="压缩后" class="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">压缩质量</label>
            <span class="text-sm text-gray-500 dark:text-gray-400">{Math.round(quality * 100)}%</span>
          </div>
          <input type="range" min="0.1" max="1" step="0.1" bind:value={quality} class="w-full accent-primary-600" />
        </div>

        <div class="flex justify-center pt-4">
          <button onclick={() => { const a = document.createElement('a'); a.href = compressedUrl; a.download = `compressed_${originalFile?.name}`; a.click(); }} class="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm">
            下载压缩图片
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>