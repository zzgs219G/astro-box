import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadShareUrl } from 'lanzou-api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getData() {
  const dataPath = path.join(__dirname, 'public', 'lanzou_source.json');
  const allDataPath = path.join(__dirname, 'public', 'lanzou_db.json');

  if (!fs.existsSync(dataPath)) {
    console.error('❌ 错误: 未找到配置文件 public/lanzou-source.json');
    process.exit(1);
  }

  const sourceData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // 初始化子标签，默认带上“全部”
  const tags = [{ id: 'all', name: '全部' }];
  const list = [];

  // 开始循环遍历你的蓝奏云种子地址
  for (const resource of sourceData.resources) {
    // 动态把当前蓝奏云文件夹的 title 作为前端的过滤标签
    tags.push({
      id: resource.id,
      name: resource.title,
      categoryId: resource.categoryId // 把大分类 ID 关联上，方便三级联动
    });

    console.log(`📡 正在抓取: [${resource.title}] -> ${resource.lanzaoUrl}...`);
    try {
      const result = await loadShareUrl(resource.lanzaoUrl);

      if (result && result.value && result.value.type === 'folder') {
        const nodes = result.value.nodes || [];

        for (const node of nodes) {
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

          list.push({
            id: node.id,
            title: node.name_all,
            description: `大小: ${node.size}  |  更新时间: ${node.time}`,
            tagId: resource.id,          // 绑定子分类（如：学习资料）
            categoryId: resource.categoryId, // 绑定大分类（如：软件库）
            lanzaoUrl: node.shareUrl,
            createdAt: todayStr,
            password: ''
          });
        }
        console.log(`  -> 🎉 成功找到 ${nodes.length} 个资源文件`);
      } else {
        console.warn(`  -> ⚠️ 无法解析文件夹或该文件夹为空。`);
      }
    } catch (err) {
      console.error(`  -> ❌ 抓取失败，请检查链接是否失效: ${resource.lanzaoUrl}`, err);
    }
  }

  // 🌟 把大分类、子标签、文件列表整合打包成一个完美的本地数据库
  const allData = {
    categories: sourceData.categories,
    tags,
    list
  };

  fs.writeFileSync(allDataPath, JSON.stringify(allData, null, 2));
  console.log('──────────────────────────────────────────────────');
  console.log('🏁 ✅ 完美！已成功炼化并生成本地数据库: public/lanzou-db.json');
}

getData().catch(console.error);
