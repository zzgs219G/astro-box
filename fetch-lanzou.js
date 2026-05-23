import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadShareUrl } from 'lanzou-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseLanzouTime(timeStr) {
  const now = new Date();
  if (timeStr.includes('秒前') || timeStr.includes('分钟前') || timeStr.includes('小时前')) {
    return now.toISOString().split('T')[0];
  }
  if (timeStr.includes('昨天')) {
    now.setDate(now.getDate() - 1);
    return now.toISOString().split('T')[0];
  }
  if (timeStr.includes('前天')) {
    now.setDate(now.getDate() - 2);
    return now.toISOString().split('T')[0];
  }
  if (timeStr.includes('天前')) {
    const days = parseInt(timeStr.replace(/[^0-9]/g, ''), 10) || 0;
    now.setDate(now.getDate() - days);
    return now.toISOString().split('T')[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(timeStr)) {
    return timeStr;
  }
  return now.toISOString().split('T')[0];
}

async function getData() {
  const dataPath = path.join(__dirname, 'public', 'lanzou_source.json');
  const allDataPath = path.join(__dirname, 'public', 'lanzou_db.json');

  if (!fs.existsSync(dataPath)) {
    console.error('❌ 错误: 未找到配置文件 public/lanzou_source.json');
    process.exit(1);
  }

  const sourceData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const tags = [{ id: 'all', name: '全部' }];
  const list = [];
  let isAnyFetchSuccess = false; // 跟踪是否有任何一个文件夹成功被解析

  for (const resource of sourceData.resources) {
    tags.push({
      id: resource.id,
      name: resource.title,
      categoryId: resource.categoryId
    });

    console.log(`📡 正在抓取: [${resource.title}] -> ${resource.lanzaoUrl}...`);
    try {
      const result = await loadShareUrl(resource.lanzaoUrl);
      if (result && result.value && result.value.type === 'folder') {
        const nodes = result.value.nodes || [];
        for (const node of nodes) {
          const actualDateStr = parseLanzouTime(node.time);
          let iconUrl = '';
          if (node.ico && node.p_ico === 1) {
            iconUrl = `https://image.dmpdmp.com/image/ico/${node.ico}`;
          }
          list.push({
            id: node.id,
            title: node.name_all,
            description: `大小: ${node.size}  |  更新时间: ${node.time}`,
            tagId: resource.id,
            categoryId: resource.categoryId,
            lanzaoUrl: node.shareUrl,
            iconUrl: iconUrl,
            createdAt: actualDateStr,
            password: ''
          });
        }
        console.log(`  -> 🎉 成功找到 ${nodes.length} 个资源文件`);
        isAnyFetchSuccess = true;
      } else {
        console.warn(`  -> ⚠️ 无法解析该文件夹或结构为空。`);
      }
    } catch (err) {
      console.error(`  -> ❌ 抓取失败，链接可能失效或被蓝奏云封锁: ${resource.lanzaoUrl}`, err);
    }
  }

  // 🌟 核心 P0 级防御策略
  if (!isAnyFetchSuccess || list.length === 0) {
    console.error('⚠️ [CRITICAL] 所有蓝奏云节点抓取全部失败。为防止线上数据库被爆空，本次构建将拒绝覆盖旧数据！');
    if (fs.existsSync(allDataPath)) {
      console.log('🏁 ✅ 已成功启用本地旧版缓存数据库兜底，确保网站正常运行。');
      return;
    } else {
      console.error('❌ 错误: 本地未找到任何历史数据缓存，构建终止。');
      process.exit(1);
    }
  }

  const allData = {
    categories: sourceData.categories,
    tags,
    list
  };

  fs.writeFileSync(allDataPath, JSON.stringify(allData, null, 2));
  console.log('──────────────────────────────────────────────────');
  console.log('🏁 ✅ 完美！已成功炼化并更新本地数据库: public/lanzou_db.json');
}

getData().catch(console.error);
