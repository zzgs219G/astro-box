import { loadShareUrl } from 'lanzou-api';

async function test() {
  const result = await loadShareUrl('https://yxlzy.lanzoue.com/b00wmbo4oj');
  console.log(JSON.stringify(result, null, 2));
}

test();
