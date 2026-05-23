<script lang="ts">
  let workspaceOpen = $state(false);
  let originalFile = $state<File | null>(null);
  let originalImage = new Image();
  let resultUrl = $state('');
  let currentPosition = $state('center');
  
  let watermarkText = $state('仅供参考');
  let watermarkColor = $state('#ffffff');
  let watermarkOpacity = $state(0.5);
  let watermarkSize = $state(0.05);
  let isDragOver = $state(false);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    originalFile = file;
    workspaceOpen = true;
    const url = URL.createObjectURL(file);
    originalImage.onload = () => {
      drawWatermark();
      URL.revokeObjectURL(url);
    };
    originalImage.src = url;
  }

  function drawWatermark() {
    if (!originalFile || !originalImage.src) return;
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(originalImage, 0, 0);
    if (!watermarkText) {
      updatePreview(canvas);
      return;
    }
    
    const fontSize = canvas.width * watermarkSize;
    ctx.font = `bold ${fontSize}px sans-serif`;
    
    const hex = watermarkColor;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${watermarkOpacity})`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    const textWidth = ctx.measureText(watermarkText).width;
    const padding = fontSize * 0.5;
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    
    switch (currentPosition) {
      case 'top-left': x = textWidth / 2 + padding; y = fontSize / 2 + padding; break;
      case 'top-center': x = canvas.width / 2; y = fontSize / 2 + padding; break;
      case 'top-right': x = canvas.width - textWidth / 2 - padding; y = fontSize / 2 + padding; break;
      case 'center-left': x = textWidth / 2 + padding; y = canvas.height / 2; break;
      case 'center-right': x = canvas.width - textWidth / 2 - padding; y = canvas.height / 2; break;
      case 'bottom-left': x = textWidth / 2 + padding; y = canvas.height - fontSize / 2 - padding; break;
      case 'bottom-center': x = canvas.width / 2; y = canvas.height - fontSize / 2 - padding; break;
      case 'bottom-right': x = canvas.width - textWidth / 2 - padding; y = canvas.height - fontSize / 2 - padding; break;
    }
    
    ctx.fillText(watermarkText, x, y);
    updatePreview(canvas);
  }

  function updatePreview(canvas: HTMLCanvasElement) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl = URL.createObjectURL(blob);
    }, originalFile?.type || 'image/png', 0.95);
  }

  $effect(() => {
    if (watermarkText || watermarkColor || watermarkOpacity || watermarkSize || currentPosition) {
      drawWatermark();
    }
  });
</script>

<div class="max-w-4xl mx-auto py-12 px-4">
  <div class="text-center mb-10">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">💧 图片加水印</h1>
    <p class="text-gray-500 dark:text-gray-400">本地添加文字水印，自定义位置、颜色、透明度</p>
  </div>

  <div class="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-[1.25rem] p-8 border border-gray-200/50 dark:border-zinc-800/50 shadow-sm">
    <input type="file" id="fileInputWatermark" accept="image/*" class="hidden" onchange={(e) => handleFile((e.target as HTMLInputElement).files?.[0]!)} />
    
    <div
      onclick={() => document.getElementById('fileInputWatermark')?.click()}
      ondragover={(e) => { e.preventDefault(); isDragOver = true; }}
      ondragleave={(e) => { e.preventDefault(); isDragOver = false; }}
      ondrop={(e) => { e.preventDefault(); isDragOver = false; const file = e.dataTransfer?.files[0]; if (file) handleFile(file); }}
      class="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors duration-300
        {workspaceOpen ? 'hidden' : ''}
        {isDragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-300 dark:border-zinc-700 hover:border-primary-500 hover:bg-primary-50'}"
    >
      <div class="text-4xl mb-4">📤</div>
      <p class="text-gray-600 dark:text-gray-300 font-medium">点击或拖拽上传图片文件</p>
    </div>

    {#if workspaceOpen}
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">水印文字</label>
            <input type="text" bind:value={watermarkText} class="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">颜色</label>
            <input type="color" bind:value={watermarkColor} class="w-12 h-12 p-1 bg-transparent border-0 cursor-pointer rounded-xl" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">透明度</label>
              <span class="text-sm text-gray-500 dark:text-gray-400">{Math.round(watermarkOpacity * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" bind:value={watermarkOpacity} class="w-full accent-primary-600" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">字体大小 (比例)</label>
              <span class="text-sm text-gray-500 dark:text-gray-400">{Math.round(watermarkSize * 100)}%</span>
            </div>
            <input type="range" min="0.01" max="0.3" step="0.01" bind:value={watermarkSize} class="w-full accent-primary-600" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">位置</label>
            <div class="grid grid-cols-3 gap-2 w-32">
              {#each ['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'] as pos}
                <button onclick={() => currentPosition = pos} class="border border-gray-200 dark:border-zinc-700 p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 {currentPosition === pos ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500 text-primary-600' : ''}">
                  {#if pos === 'top-left'}↖{:else if pos === 'top-center'}↑{:else if pos === 'top-right'}↗{:else if pos === 'center-left'}←{:else if pos === 'center'}·{:else if pos === 'center-right'}→{:else if pos === 'bottom-left'}↙{:else if pos === 'bottom-center'}↓{:else if pos === 'bottom-right'}↘{/if}
                </button>
              {/each}
            </div>
          </div>
          <div class="pt-4">
            <button onclick={() => { const baseName = originalFile?.name.replace(/\.[^/.]+$/, ""); const ext = originalFile?.name.split('.').pop(); const a = document.createElement('a'); a.href = resultUrl; a.download = `${baseName}_watermark.${ext}`; a.click(); }} class="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm">
              下载图片
            </button>
          </div>
        </div>

        <div class="flex flex-col">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">实时预览</h3>
          <div class="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-xl p-2 flex items-center justify-center overflow-hidden min-h-[300px]">
            <img src={resultUrl} alt="实时预览" class="max-w-full max-h-full object-contain shadow-sm" />
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>