// ============================================================
// 第一试卷网下载器 - Web Edition
// 数据源: https://www.shijuan1.com/
// 仅使用 Node.js 内置模块，零依赖运行
// ============================================================

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3211;
const SITE_BASE = 'https://www.shijuan1.com';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// ---- 学科 / 年级分类映射 ----
// 路径前缀对应第一试卷网的栏目目录
const CATEGORIES = {
  yuwen:   { name: '语文试卷', prefix: 'sjyw', grades: ['1','2','3','4','5','6','7','8','9','zk','g1','g2','g3','gk'] },
  shuxue:  { name: '数学试卷', prefix: 'sjsx', grades: ['1','2','3','4','5','6','7','8','9','zk','g1','g2','g3','gk'] },
  yingyu:  { name: '英语试卷', prefix: 'sjyy', grades: ['1','2','3','4','5','6','7','8','9','zk','g1','g2','g3','gk'] },
  wuli:    { name: '物理试卷', prefix: 'sjwl', grades: ['8','9','zk','g1','g2','g3','gk'] },
  huaxue:  { name: '化学试卷', prefix: 'sjhx', grades: ['9','zk','g1','g2','g3','gk'] },
  zhengzhi:{ name: '政治试卷', prefix: 'sjzz', grades: ['7','8','9','zk','g1','g2','g3','gk'] },
  lishi:   { name: '历史试卷', prefix: 'sjls', grades: ['7','8','9','zk','g1','g2','g3','gk'] },
  dili:    { name: '地理试卷', prefix: 'sjdl', grades: ['7','8','zk','g1','g2','g3','gk'] },
  shengwu: { name: '生物试卷', prefix: 'sjsw', grades: ['7','8','zk','g1','g2','g3','gk'] },
};

const GRADE_NAMES = {
  '1': '一年级', '2': '二年级', '3': '三年级', '4': '四年级',
  '5': '五年级', '6': '六年级', '7': '七年级', '8': '八年级',
  '9': '九年级', 'zk': '中考试卷', 'g1': '高一', 'g2': '高二',
  'g3': '高三', 'gk': '高考试卷',
};

// 根据学科前缀和年级代码生成栏目路径，如 sjyw + 1 => /a/sjyw1/
function categoryPath(subjectKey, gradeCode) {
  const cat = CATEGORIES[subjectKey];
  if (!cat) return null;
  return '/a/' + cat.prefix + gradeCode + '/';
}

// ---- HTTP 请求辅助 ----
const REQUEST_TIMEOUT = 60000;

function resolveUserPath(p) {
  if (!p) return p;
  if (p === '~' || p.startsWith('~/') || p.startsWith('~\\')) {
    p = path.join(require('os').homedir(), p.slice(1));
  }
  return path.resolve(p);
}

function getFreeSpaceBytes(targetDir) {
  try {
    if (typeof fs.statfsSync === 'function') {
      const s = fs.statfsSync(targetDir);
      return s.bavail * s.bsize;
    }
  } catch (_) { /* fall through */ }
  try {
    const root = path.parse(path.resolve(targetDir)).root;
    const drive = root.replace(/[\\/:]/g, '');
    if (drive) {
      const out = execSync(
        `powershell -NoProfile -Command "(Get-PSDrive -Name ${drive} -ErrorAction Stop).Free"`,
        { timeout: 8000, windowsHide: true }
      ).toString().trim();
      const n = parseInt(out, 10);
      if (!isNaN(n)) return n;
    }
  } catch (_) { /* unknown */ }
  return null;
}

// 抓取远程 URL，返回 Buffer。支持 http/https。
function fetchUrl(targetUrl, extraHeaders) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;
    const reqHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Referer': SITE_BASE + '/',
      ...(extraHeaders || {}),
    };
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: reqHeaders,
      rejectUnauthorized: false,
    };
    // 处理重定向
    const req = lib.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, targetUrl).href;
        res.resume();
        fetchUrl(redirectUrl, extraHeaders).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) });
      });
    });
    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT, () => {
      req.destroy(new Error(`Request timeout after ${REQUEST_TIMEOUT}ms`));
    });
    req.end();
  });
}

// 将 gb2312 编码的 Buffer 转为 UTF-8 字符串
// Node.js 内置 iconv 不支持 gb2312，用 PowerShell 做转换作为兜底
function decodeGb2312(buf) {
  // 优先尝试 Node 内置 TextDecoder（Node 18+ 支持 gb18030，兼容 gb2312）
  try {
    if (typeof TextDecoder !== 'undefined') {
      const td = new TextDecoder('gb18030');
      return td.decode(buf);
    }
  } catch (_) { /* fall through */ }
  // 兜底：用 PowerShell 转换
  try {
    const tmpIn = path.join(require('os').tmpdir(), 'sj1_dec_in.bin');
    fs.writeFileSync(tmpIn, buf);
    const psScript = `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$b = [System.IO.File]::ReadAllBytes('${tmpIn.replace(/'/g, "''")}')
$enc = [System.Text.Encoding]::GetEncoding('gb2312')
[System.Text.Encoding]::UTF8.GetString($enc.GetBytes([System.Text.Encoding]::GetEncoding('gb2312').GetString($b)))`;
    const tmpPs = path.join(require('os').tmpdir(), 'sj1_dec.ps1');
    fs.writeFileSync(tmpPs, '\uFEFF' + psScript, 'utf8');
    const out = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tmpPs}"`, { timeout: 15000, windowsHide: true, encoding: 'utf8' });
    try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpPs); } catch (_) {}
    return out;
  } catch (e) {
    // 最后兜底：直接当 latin1 读
    return buf.toString('latin1');
  }
}

// ---- HTML 解析：列表页 ----
// 从列表页 HTML 中提取试卷条目和分页信息
function parseListPage(html, pageUrl) {
  const items = [];
  // 先按 </tr> 分割出独立的表格行，避免跨行匹配
  const trBlocks = html.split(/<\/tr>/i);
  for (const block of trBlocks) {
    // 只处理包含 class="title" 链接的行（数据行）
    const linkMatch = block.match(/<a\s+href="([^"]+)"\s+class="title"[^>]*>([^<]+)<\/a>/);
    if (!linkMatch) continue;
    const href = linkMatch[1];
    const title = linkMatch[2].trim();
    if (!href || !href.includes('/a/sj')) continue;
    // 提取所有 <td> 单元格内容
    const cells = block.match(/<td[^>]*>[\s\S]*?<\/td>/g);
    let fileType = '', version = '', size = '', date = '';
    if (cells && cells.length >= 6) {
      // cells[0]=title link, cells[1]=file type, cells[2]=category, cells[3]=version, cells[4]=size, cells[5]=date
      const extractText = (c) => c.replace(/<[^>]+>/g, '').trim();
      fileType = extractText(cells[1]);
      version = extractText(cells[3]);
      size = extractText(cells[4]);
      date = extractText(cells[5]);
    }
    const fullUrl = href.startsWith('http') ? href : SITE_BASE + href;
    items.push({ title, url: fullUrl, fileType, version, size, date });
  }

  // 解析分页信息
  let totalPages = 1;
  let totalItems = items.length;
  const pageMatch = html.match(/共\s*<strong>(\d+)<\/strong>页\s*<strong>(\d+)<\/strong>条/);
  if (pageMatch) {
    totalPages = parseInt(pageMatch[1], 10);
    totalItems = parseInt(pageMatch[2], 10);
  } else {
    // 尝试从分页链接推断最大页码
    const pageLinks = html.match(/list_\d+_(\d+)\.html/g);
    if (pageLinks) {
      const maxPage = Math.max(...pageLinks.map(l => parseInt(l.match(/list_\d+_(\d+)/)[1], 10)));
      if (maxPage > totalPages) totalPages = maxPage;
    }
  }

  // 提取 typeid（用于翻页），如 list_106_2.html 中的 106
  let typeId = null;
  const typeIdMatch = html.match(/list_(\d+)_\d+\.html/);
  if (typeIdMatch) typeId = typeIdMatch[1];

  return { items, totalPages, totalItems, typeId };
}

// ---- HTML 解析：详情页 ----
// 从详情页提取试卷详细信息和下载地址
function parseDetailPage(html, detailUrl) {
  const info = { title: '', id: '', version: '', resourceType: '', size: '', fileType: '', publishDate: '', license: '', downloadUrl: '', description: '' };

  // 标题
  const titleMatch = html.match(/<div class="title">\s*<h2>([^<]+)<\/h2>/);
  if (titleMatch) info.title = titleMatch[1].trim();

  // 信息列表
  const infoMatch = html.match(/<div class="infolist">([\s\S]*?)<\/div>/);
  if (infoMatch) {
    const infoBlock = infoMatch[1];
    const getField = (label) => {
      const re = new RegExp('<small>' + label + '</small><span>([^<]*)</span>');
      const fm = infoBlock.match(re);
      return fm ? fm[1].trim() : '';
    };
    info.id = getField('编号ＩＤ：');
    info.version = getField('教材版本：');
    info.resourceType = getField('资源类型：');
    info.size = getField('资源大小：');
    info.fileType = getField('文件类型：');
    info.publishDate = getField('发布时间：');
    info.license = getField('授权方式：');
  }

  // 下载地址：<ul class="downurllist"><li><a href="/uploads/soft/..." target="_blank">本地下载</a></li>
  const dlMatch = html.match(/<ul class="downurllist">[\s\S]*?<a\s+href="([^"]+)"[^>]*>([^<]*)<\/a>/);
  if (dlMatch) {
    const dlHref = dlMatch[1];
    info.downloadUrl = dlHref.startsWith('http') ? dlHref : SITE_BASE + dlHref;
    info.downloadLabel = dlMatch[2].trim();
    // 网站元数据中的"文件类型"经常与真实文件不符（如标 .doc 实为 .rar），
    // 以下载地址的扩展名为准覆盖之
    const urlPath = info.downloadUrl.split('?')[0].split('#')[0];
    const extMatch = urlPath.match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch) {
      const realExt = '.' + extMatch[1].toLowerCase();
      info.fileType = realExt;
      info.realFileType = realExt;
    }
  }

  // 试卷介绍
  const descMatch = html.match(/<div class="labeltitle">\s*<strong>试卷介绍<\/strong>[\s\S]*?<div class="content">([\s\S]*?)<\/div>/);
  if (descMatch) {
    info.description = descMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  return info;
}

// ---- HTTP 服务器 ----
const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, 'http://localhost');
  const query = Object.fromEntries(parsed.searchParams.entries());

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ---- 分类目录接口 ----
  if (parsed.pathname === '/api/categories') {
    const result = {};
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      result[key] = {
        name: cat.name,
        prefix: cat.prefix,
        grades: cat.grades.map(g => ({ code: g, name: GRADE_NAMES[g], path: categoryPath(key, g) })),
      };
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result));
    return;
  }

  // ---- 列表页接口 ----
  // /api/list?subject=yuwen&grade=1&page=1
  if (parsed.pathname === '/api/list') {
    const subject = query.subject;
    const grade = query.grade;
    const page = parseInt(query.page || '1', 10);
    if (!subject || !grade || !CATEGORIES[subject]) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 subject 或 grade 参数' }));
      return;
    }
    const catPath = categoryPath(subject, grade);
    if (!catPath) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '无效的分类' }));
      return;
    }
    try {
      let listUrl;
      if (page <= 1) {
        listUrl = SITE_BASE + catPath;
      } else {
        // 需要先获取第一页拿到 typeid，再拼接 list_{typeid}_{page}.html
        const firstResult = await fetchAndParseList(SITE_BASE + catPath);
        if (!firstResult.typeId) {
          // 无法获取 typeid，直接返回第一页结果
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ page: 1, ...firstResult }));
          return;
        }
        listUrl = SITE_BASE + catPath + 'list_' + firstResult.typeId + '_' + page + '.html';
      }
      const result = await fetchAndParseList(listUrl);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ page, subject, grade, ...result }));
    } catch (e) {
      console.error('[List] Error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // 辅助：抓取并解析列表页
  async function fetchAndParseList(listUrl) {
    const result = await fetchUrl(listUrl);
    const html = decodeGb2312(result.body);
    return parseListPage(html, listUrl);
  }

  // ---- 详情页接口 ----
  // /api/detail?url=https://www.shijuan1.com/a/sjyw6/334332.html
  if (parsed.pathname === '/api/detail') {
    const detailUrl = query.url;
    if (!detailUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 url 参数' }));
      return;
    }
    try {
      const result = await fetchUrl(detailUrl);
      const html = decodeGb2312(result.body);
      const info = parseDetailPage(html, detailUrl);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(info));
    } catch (e) {
      console.error('[Detail] Error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 批量详情接口（仅获取真实文件格式与下载地址）----
  // /api/batch-detail?urls=url1&urls=url2...
  // 用于在浏览页异步补全真实文件类型（网站元数据经常不准）
  if (parsed.pathname === '/api/batch-detail') {
    const urls = parsed.searchParams.getAll('urls');
    if (!urls.length) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 urls 参数' }));
      return;
    }
    try {
      // 限制单次批量数量，避免滥用
      const limited = urls.slice(0, 40);
      const results = await Promise.all(limited.map(async (detailUrl) => {
        try {
          const result = await fetchUrl(detailUrl);
          const html = decodeGb2312(result.body);
          const info = parseDetailPage(html, detailUrl);
          return {
            url: detailUrl,
            fileType: info.fileType || '',
            downloadUrl: info.downloadUrl || '',
            size: info.size || '',
          };
        } catch (e) {
          return { url: detailUrl, fileType: '', downloadUrl: '', size: '', error: e.message };
        }
      }));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ items: results }));
    } catch (e) {
      console.error('[BatchDetail] Error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 搜索接口 ----
  // 第一试卷网无站内搜索接口，采用深度分类搜索：
  // 在指定学科的所有年级分类中抓取前 N 页，按关键词过滤
  // /api/search?keyword=期中&subject=yuwen&maxPages=2
  if (parsed.pathname === '/api/search') {
    const keyword = query.keyword;
    const subject = query.subject || 'yuwen';
    const maxPages = parseInt(query.maxPages || '2', 10);
    if (!keyword) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 keyword 参数' }));
      return;
    }
    if (!CATEGORIES[subject]) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '无效的学科' }));
      return;
    }
    try {
      const cat = CATEGORIES[subject];
      // 并发抓取所有年级的第一页
      const firstPagePromises = cat.grades.map(async (grade) => {
        const catPath = categoryPath(subject, grade);
        if (!catPath) return { grade, items: [], typeId: null, totalPages: 0 };
        try {
          const result = await fetchAndParseList(SITE_BASE + catPath);
          return { grade, items: result.items || [], typeId: result.typeId, totalPages: result.totalPages };
        } catch (e) {
          return { grade, items: [], typeId: null, totalPages: 0 };
        }
      });
      const firstPages = await Promise.all(firstPagePromises);

      const allItems = [];
      // 过滤第一页结果并收集需要抓取的后续页
      const followUpPages = [];
      for (const fp of firstPages) {
        for (const item of fp.items) {
          if (item.title.includes(keyword)) {
            allItems.push({ ...item, subject: cat.name, grade: GRADE_NAMES[fp.grade] });
          }
        }
        if (fp.typeId && fp.totalPages > 1 && maxPages > 1) {
          const catPath = categoryPath(subject, fp.grade);
          const pagesToFetch = Math.min(maxPages, fp.totalPages);
          for (let p = 2; p <= pagesToFetch; p++) {
            followUpPages.push({ grade: fp.grade, url: SITE_BASE + catPath + 'list_' + fp.typeId + '_' + p + '.html' });
          }
        }
      }

      // 并发抓取后续页
      if (followUpPages.length > 0) {
        const followUpPromises = followUpPages.map(async (fp) => {
          try {
            const result = await fetchAndParseList(fp.url);
            return { grade: fp.grade, items: result.items || [] };
          } catch (e) {
            return { grade: fp.grade, items: [] };
          }
        });
        const followUpResults = await Promise.all(followUpPromises);
        for (const fr of followUpResults) {
          for (const item of fr.items) {
            if (item.title.includes(keyword)) {
              allItems.push({ ...item, subject: cat.name, grade: GRADE_NAMES[fr.grade] });
            }
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        keyword, subject,
        items: allItems,
        totalItems: allItems.length,
        totalPages: 1,
      }));
    } catch (e) {
      console.error('[Search] Error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 通用代理接口（gb2312 转 UTF-8 文本）----
  if (parsed.pathname === '/api/proxy') {
    const targetUrl = query.url;
    if (!targetUrl) { res.writeHead(400); res.end('Missing url param'); return; }
    try {
      const result = await fetchUrl(targetUrl);
      const html = decodeGb2312(result.body);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 文件下载代理（二进制流）----
  if (parsed.pathname === '/api/download-proxy') {
    const targetUrl = query.url;
    if (!targetUrl) { res.writeHead(400); res.end('Missing url param'); return; }
    try {
      const result = await fetchUrl(targetUrl);
      const contentType = result.headers['content-type'] || 'application/octet-stream';
      const respHeaders = { 'Content-Type': contentType };
      if (result.headers['content-disposition']) respHeaders['Content-Disposition'] = result.headers['content-disposition'];
      else {
        const filename = targetUrl.split('/').pop().split('?')[0] || 'download';
        respHeaders['Content-Disposition'] = `attachment; filename="${filename}"`;
      }
      if (result.headers['content-length']) respHeaders['Content-Length'] = result.headers['content-length'];
      res.writeHead(result.statusCode, respHeaders);
      res.end(result.body);
    } catch (e) {
      console.error('[DownloadProxy] Error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 保存文件到磁盘 ----
  // /api/save-file?url=<downloadUrl>&path=<savePath>&name=<fileName>
  if (parsed.pathname === '/api/save-file') {
    const targetUrl = query.url;
    const savePath = query.path;
    const fileName = query.name;
    if (!targetUrl || !savePath || !fileName) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 url、path 或 name 参数' }));
      return;
    }
    try {
      const result = await fetchUrl(targetUrl);
      const body = result.body;
      const dir = resolveUserPath(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // 清理文件名中的非法字符
      const safeName = fileName.replace(/\//g, '-').replace(/[<>:"\\|?*]/g, '_');
      const filePath = path.join(dir, safeName);
      // 磁盘空间检查
      const free = getFreeSpaceBytes(dir);
      if (free != null && free < body.length) {
        res.writeHead(507, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '磁盘空间不足', free, needed: body.length }));
        return;
      }
      fs.writeFileSync(filePath, body);
      console.log(`[SaveFile] 已保存: ${filePath} (${body.length} bytes)`);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, filePath, size: body.length }));
    } catch (e) {
      console.error('[SaveFile] Error:', e.message);
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 文件夹选择器（Windows 原生）----
  if (parsed.pathname === '/api/browse-folder') {
    try {
      const tmpFile = path.join(require('os').tmpdir(), 'sj1_browse.ps1');
      const psScript = `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = '选择下载保存文件夹'
$dialog.ShowNewFolderButton = $true
if ($dialog.ShowDialog() -eq 'OK') { Write-Output $dialog.SelectedPath }`;
      fs.writeFileSync(tmpFile, '\uFEFF' + psScript, 'utf8');
      const buf = execSync(`powershell -NoProfile -STA -ExecutionPolicy Bypass -File "${tmpFile}"`, { timeout: 60000, windowsHide: true });
      try { fs.unlinkSync(tmpFile); } catch (_) {}
      const result = buf.toString('utf8').trim();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ path: result || null }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 检查文件是否存在 ----
  if (parsed.pathname === '/api/check-file') {
    const filePath = query.path;
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 path 参数' }));
      return;
    }
    try {
      const resolved = resolveUserPath(filePath);
      const exists = fs.existsSync(resolved);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ exists, path: resolved }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 打开文件 ----
  if (parsed.pathname === '/api/open-file') {
    const filePath = query.path;
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 path 参数' }));
      return;
    }
    try {
      const resolved = resolveUserPath(filePath);
      if (!fs.existsSync(resolved)) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '文件不存在: ' + resolved }));
        return;
      }
      const openPsScript = `Start-Process -FilePath '${resolved.replace(/'/g, "''")}'`;
      const tmpFile = path.join(require('os').tmpdir(), 'sj1_open.ps1');
      fs.writeFileSync(tmpFile, '\uFEFF' + openPsScript, 'utf8');
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tmpFile}"`, { timeout: 10000, windowsHide: true });
      try { fs.unlinkSync(tmpFile); } catch (_) {}
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 删除文件 ----
  if (parsed.pathname === '/api/delete-file') {
    const filePath = query.path;
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 path 参数' }));
      return;
    }
    try {
      const resolved = resolveUserPath(filePath);
      if (fs.existsSync(resolved)) {
        fs.unlinkSync(resolved);
        console.log(`[DeleteFile] 已删除: ${resolved}`);
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 磁盘空间查询 ----
  if (parsed.pathname === '/api/disk-space') {
    const target = query.path;
    if (!target) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 path 参数' }));
      return;
    }
    try {
      const resolved = resolveUserPath(target);
      const free = getFreeSpaceBytes(resolved);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ free, path: resolved }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 在资源管理器中定位文件 ----
  if (parsed.pathname === '/api/reveal-file') {
    const filePath = query.path;
    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: '缺少 path 参数' }));
      return;
    }
    try {
      const resolved = resolveUserPath(filePath);
      if (!fs.existsSync(resolved)) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '文件不存在: ' + resolved }));
        return;
      }
      const revealPsScript = `Start-Process explorer.exe -ArgumentList '/select,"${resolved.replace(/'/g, "''")}"'`;
      const tmpFile = path.join(require('os').tmpdir(), 'sj1_reveal.ps1');
      fs.writeFileSync(tmpFile, '\uFEFF' + revealPsScript, 'utf8');
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tmpFile}"`, { timeout: 10000, windowsHide: true });
      try { fs.unlinkSync(tmpFile); } catch (_) {}
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ---- 静态文件服务 ----
  let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  filePath = path.join(__dirname, 'public', filePath);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，正在尝试清理旧进程...`);
    try {
      const out = execSync(`netstat -ano | findstr ":${PORT}" | findstr "LISTENING"`, { encoding: 'utf8' });
      const pids = [...new Set(out.trim().split('\n').map(l => l.trim().split(/\s+/).pop()))];
      for (const pid of pids) {
        if (pid && pid !== String(process.pid)) {
          console.log(`正在终止进程 PID ${pid}...`);
          try { execSync(`taskkill /f /pid ${pid}`); } catch (e) {}
        }
      }
      setTimeout(() => {
        server.listen(PORT, '127.0.0.1');
        console.log(`重试监听端口 ${PORT}`);
      }, 2000);
    } catch (err) {
      console.error('清理端口失败:', err.message);
      process.exit(1);
    }
  } else {
    console.error('服务器错误:', e);
    process.exit(1);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`============================================`);
  console.log(`  第一试卷网下载器已启动`);
  console.log(`  访问地址: http://localhost:${PORT}`);
  console.log(`  数据来源: ${SITE_BASE}`);
  console.log(`============================================`);
});
