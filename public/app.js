// ============================================================
// 第一试卷网下载器 - 前端逻辑引擎
// 数据源: https://www.shijuan1.com/
// ============================================================

// ---- 学科配置（含 SVG 图标和主题色）----
const SUBJECTS = {
  yuwen: {
    name: '语文试卷', color: '#007aff', bg: 'rgba(0,122,255,0.1)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/><path d="M9.5 16.5l-2 2"/></svg>',
    grades: ['1','2','3','4','5','6','7','8','9','zk','g1','g2','g3','gk'],
  },
  shuxue: {
    name: '数学试卷', color: '#5856d6', bg: 'rgba(88,86,214,0.1)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><circle cx="7" cy="17" r="0.5" fill="#fff"/><circle cx="3" cy="3" r="0.5" fill="#fff"/><path d="M7 14c1.5-3 3-8 5.5-8s3 5 5 4 2.5-4 3.5-6"/></svg>',
    grades: ['1','2','3','4','5','6','7','8','9','zk','g1','g2','g3','gk'],
  },
  yingyu: {
    name: '英语试卷', color: '#34c759', bg: 'rgba(52,199,89,0.1)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 8h8"/><path d="M8 12h5"/></svg>',
    grades: ['1','2','3','4','5','6','7','8','9','zk','g1','g2','g3','gk'],
  },
  wuli: {
    name: '物理试卷', color: '#ff9500', bg: 'rgba(255,149,0,0.1)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="2.5" fill="#fff" stroke="none"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>',
    grades: ['8','9','zk','g1','g2','g3','gk'],
  },
  huaxue: {
    name: '化学试卷', color: '#ff2d55', bg: 'rgba(255,45,85,0.1)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6.5L5 19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l-5-9.5V3"/><path d="M7 15h10" opacity="0.7"/><circle cx="10" cy="18" r="1" fill="#fff" stroke="none"/><circle cx="14" cy="17" r="0.8" fill="#fff" stroke="none"/></svg>',
    grades: ['9','zk','g1','g2','g3','gk'],
  },
  zhengzhi: {
    name: '政治试卷', color: '#af52de', bg: 'rgba(175,82,222,0.1)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v18"/><path d="M4 7h16"/><path d="M4 7L2 13c0 1.5 1 2 2 2s2-.5 2-2L4 7z"/><path d="M20 7l-2 6c0 1.5 1 2 2 2s2-.5 2-2l-2-6z"/><path d="M8 20h8"/></svg>',
    grades: ['7','8','9','zk','g1','g2','g3','gk'],
  },
  lishi: {
    name: '历史试卷', color: '#a2845e', bg: 'rgba(162,132,94,0.12)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h14"/><path d="M5 21h14"/><path d="M7 3v2c0 3.5 2 5.5 5 7-3 1.5-5 3.5-5 7v2"/><path d="M17 3v2c0 3.5-2 5.5-5 7 3 1.5 5 3.5 5 7v2"/><path d="M7 7h10" opacity="0.5"/></svg>',
    grades: ['7','8','9','zk','g1','g2','g3','gk'],
  },
  dili: {
    name: '地理试卷', color: '#30b0c7', bg: 'rgba(48,176,199,0.1)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 3 4 6 4 9s-1.5 6-4 9"/><path d="M12 3c-2.5 3-4 6-4 9s1.5 6 4 9"/><path d="M4.5 7.5h15M4.5 16.5h15" opacity="0.5"/></svg>',
    grades: ['7','8','zk','g1','g2','g3','gk'],
  },
  shengwu: {
    name: '生物试卷', color: '#32d74b', bg: 'rgba(50,215,75,0.1)',
    icon: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M8 2c0 5.5 8 5.5 8 11s-8 5.5-8 11"/><path d="M16 2c0 5.5-8 5.5-8 11s8 5.5 8 11"/><path d="M6 7.5h12"/><path d="M9 13h6"/><path d="M6 18.5h12"/></svg>',
    grades: ['7','8','zk','g1','g2','g3','gk'],
  },
};

const GRADE_NAMES = {
  '1': '一年级', '2': '二年级', '3': '三年级', '4': '四年级',
  '5': '五年级', '6': '六年级', '7': '七年级', '8': '八年级',
  '9': '九年级', 'zk': '中考试卷', 'g1': '高一', 'g2': '高二',
  'g3': '高三', 'gk': '高考试卷',
};

// ---- 状态管理 ----
const State = {
  currentSubject: null,
  currentGrade: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  papers: [],
  selectedPapers: new Set(),
  searchKeyword: '',
  searchPage: 1,
  searchTotalPages: 1,
  searchResults: [],
  searchSelected: new Set(),
  settings: {
    savePath: '~/Downloads/第一试卷网',
    timeout: 60,
    theme: 'light',
  },
  downloads: [],
  bookmarks: [],
};

// ---- LocalStorage 持久化 ----
function loadState() {
  try {
    const saved = localStorage.getItem('sj1_settings');
    if (saved) Object.assign(State.settings, JSON.parse(saved));
    const dl = localStorage.getItem('sj1_downloads');
    if (dl) State.downloads = JSON.parse(dl);
    const bm = localStorage.getItem('sj1_bookmarks');
    if (bm) State.bookmarks = JSON.parse(bm);
    const sh = localStorage.getItem('sj1_search_history');
    State.searchHistory = sh ? JSON.parse(sh) : [];
  } catch (e) { console.warn('加载状态失败:', e); }
}

function saveSettings() {
  localStorage.setItem('sj1_settings', JSON.stringify(State.settings));
}
function saveDownloads() {
  localStorage.setItem('sj1_downloads', JSON.stringify(State.downloads));
  updateDownloadBadge();
}
function saveBookmarks() {
  localStorage.setItem('sj1_bookmarks', JSON.stringify(State.bookmarks));
  updateBookmarkBadge();
}
function saveSearchHistory() {
  localStorage.setItem('sj1_search_history', JSON.stringify(State.searchHistory || []));
}

// ---- 工具函数 ----
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function showToast(msg, duration) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, duration || 2500);
}

function showLoading(text) {
  $('#loadingText').textContent = text || '加载中...';
  $('#loadingOverlay').style.display = 'flex';
}
function hideLoading() {
  $('#loadingOverlay').style.display = 'none';
}

async function apiGet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// 获取文件扩展名图标类型
function getFileIconType(fileType) {
  const ft = (fileType || '').toLowerCase().replace('.', '');
  if (['doc', 'docx'].includes(ft)) return 'doc';
  if (['rar', 'zip', '7z'].includes(ft)) return 'rar';
  if (['pdf'].includes(ft)) return 'pdf';
  if (['ppt', 'pptx'].includes(ft)) return 'ppt';
  if (['xls', 'xlsx'].includes(ft)) return 'xls';
  return 'default';
}

function getFileExt(fileType) {
  const ft = (fileType || '').toLowerCase().replace('.', '');
  return ft || 'file';
}

// 异步补全真实文件格式：批量请求详情页，以下载地址扩展名覆盖元数据
// 网站列表页/详情页元数据中的"文件类型"经常与真实文件不符（如标 .doc 实为 .rar）
async function enrichFileTypes(papers, listSelector) {
  if (!papers || papers.length === 0) return;
  // 只处理还没有 downloadUrl 的条目（已有 downloadUrl 的可在本地直接推导）
  const toFetch = papers.filter(p => !p.downloadUrl).map(p => p.url);
  const urlToPaper = {};
  papers.forEach(p => { urlToPaper[p.url] = p; });

  // 先在本地对已有 downloadUrl 的条目做纠正
  let localChanged = false;
  papers.forEach(p => {
    if (p.downloadUrl) {
      const m = p.downloadUrl.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
      if (m) {
        const realExt = '.' + m[1].toLowerCase();
        if (p.fileType !== realExt) {
          p.fileType = realExt;
          localChanged = true;
        }
      }
    }
  });
  if (localChanged) updateCardsFileType(papers, listSelector);

  if (toFetch.length === 0) return;
  try {
    const params = toFetch.map(u => 'urls=' + encodeURIComponent(u)).join('&');
    const data = await apiGet(`/api/batch-detail?${params}`);
    const items = data.items || [];
    let changed = false;
    items.forEach(it => {
      const p = urlToPaper[it.url];
      if (!p) return;
      if (it.downloadUrl) {
        p.downloadUrl = it.downloadUrl;
        const m = it.downloadUrl.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
        if (m) {
          const realExt = '.' + m[1].toLowerCase();
          if (p.fileType !== realExt) {
            p.fileType = realExt;
            changed = true;
          }
        }
      } else if (it.fileType && it.fileType !== p.fileType) {
        p.fileType = it.fileType;
        changed = true;
      }
    });
    if (changed) updateCardsFileType(papers, listSelector);
  } catch (e) {
    // 静默失败，不影响浏览
    console.warn('enrichFileTypes 失败:', e.message);
  }
}

// 更新已渲染卡片的文件类型图标与标签
function updateCardsFileType(papers, listSelector) {
  papers.forEach(paper => {
    const card = document.querySelector(`${listSelector} .paper-card[data-url="${cssEscape(paper.url)}"]`);
    if (!card) return;
    const iconBox = card.querySelector('[data-role="fileicon"]');
    if (iconBox) {
      iconBox.className = 'paper-file-icon ' + getFileIconType(paper.fileType);
      const label = iconBox.querySelector('.file-type-label');
      if (label) label.textContent = getFileExt(paper.fileType);
    }
    const tag = card.querySelector('[data-role="filetype"]');
    if (tag) {
      if (paper.fileType) {
        tag.textContent = paper.fileType;
        tag.style.display = '';
      } else {
        tag.style.display = 'none';
      }
    } else if (paper.fileType) {
      // 原本没有 fileType 标签，补上
      const meta = card.querySelector('.paper-card-meta');
      if (meta) {
        const span = document.createElement('span');
        span.className = 'meta-tag';
        span.setAttribute('data-role', 'filetype');
        span.textContent = paper.fileType;
        meta.appendChild(span);
      }
    }
  });
}

// 简易 CSS 选择器转义（用于属性选择器中的 URL）
function cssEscape(s) {
  return String(s).replace(/(["\\])/g, '\\$1');
}

// 从详情页 URL 提取试卷 ID
function getPaperId(url) {
  const m = url.match(/\/(\d+)\.html/);
  return m ? m[1] : url;
}

// ---- 主题切换 ----
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  State.settings.theme = theme;
  saveSettings();
  $$('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  const themeSelect = $('#themeSelect');
  if (themeSelect) themeSelect.value = theme;
}

// ---- 页面导航 ----
function switchPage(pageName) {
  $$('.page').forEach(p => p.classList.remove('active'));
  $('#page-' + pageName).classList.add('active');
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === pageName));
}

// ---- 学科卡片渲染 ----
function renderSubjectGrid() {
  const grid = $('#subjectGrid');
  grid.innerHTML = Object.entries(SUBJECTS).map(([key, subj]) => {
    const gradeCount = subj.grades.length;
    return `
      <div class="subject-card ${State.currentSubject === key ? 'active' : ''}" 
           data-subject="${key}" 
           style="--subject-color:${subj.color};--subject-bg:${subj.bg}">
        <div class="subject-card-icon" style="background:${subj.color};color:#fff">
          ${subj.icon}
        </div>
        <div class="subject-card-name">${subj.name}</div>
        <div class="subject-card-count">${gradeCount} 个年级分类</div>
      </div>
    `;
  }).join('');

  $$('.subject-card').forEach(card => {
    card.addEventListener('click', () => {
      const subject = card.dataset.subject;
      selectSubject(subject);
    });
  });
}

function selectSubject(subjectKey) {
  State.currentSubject = subjectKey;
  State.currentGrade = null;
  $$('.subject-card').forEach(c => c.classList.toggle('active', c.dataset.subject === subjectKey));
  renderGradeBar(subjectKey);
  // 清空列表
  $('#paperList').innerHTML = '';
  $('#listToolbar').style.display = 'none';
  $('#pagination').style.display = 'none';
  $('#browseEmpty').style.display = 'flex';
}

// ---- 年级栏渲染 ----
function renderGradeBar(subjectKey) {
  const subj = SUBJECTS[subjectKey];
  if (!subj) return;
  const bar = $('#gradeBar');
  bar.style.display = 'block';
  $('#gradeBarLabel').textContent = subj.name + ' - 请选择年级';
  const tabs = $('#gradeTabs');
  tabs.innerHTML = subj.grades.map(g => {
    return `<button class="grade-tab ${State.currentGrade === g ? 'active' : ''}" data-grade="${g}">${GRADE_NAMES[g]}</button>`;
  }).join('');

  $$('.grade-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      selectGrade(subjectKey, tab.dataset.grade);
    });
  });
}

// ---- 选择年级并加载列表 ----
async function selectGrade(subjectKey, gradeCode) {
  State.currentSubject = subjectKey;
  State.currentGrade = gradeCode;
  State.currentPage = 1;
  State.selectedPapers.clear();
  $$('.grade-tab').forEach(t => t.classList.toggle('active', t.dataset.grade === gradeCode));
  $('#gradeBarLabel').textContent = SUBJECTS[subjectKey].name + ' - ' + GRADE_NAMES[gradeCode];
  await loadPaperList();
}

// ---- 加载试卷列表 ----
async function loadPaperList() {
  if (!State.currentSubject || !State.currentGrade) return;
  showLoading('正在加载试卷列表...');
  try {
    const data = await apiGet(`/api/list?subject=${State.currentSubject}&grade=${State.currentGrade}&page=${State.currentPage}`);
    State.papers = data.items || [];
    State.totalPages = data.totalPages || 1;
    State.totalItems = data.totalItems || State.papers.length;
    renderPaperList();
    renderPagination();
    updateListInfo();
  } catch (e) {
    showToast('加载失败: ' + e.message);
    $('#paperList').innerHTML = `<div class="empty-state"><p>加载失败，请检查网络连接</p></div>`;
  } finally {
    hideLoading();
  }
}

function updateListInfo() {
  const info = $('#listInfo');
  if (State.totalItems > 0) {
    info.textContent = `共 ${State.totalItems} 份试卷，第 ${State.currentPage}/${State.totalPages} 页`;
  } else {
    info.textContent = '';
  }
}

// ---- 渲染试卷列表 ----
function renderPaperList() {
  const list = $('#paperList');
  if (State.papers.length === 0) {
    list.innerHTML = `<div class="empty-state"><p>该分类下暂无试卷</p></div>`;
    $('#listToolbar').style.display = 'none';
    return;
  }
  $('#listToolbar').style.display = 'flex';
  list.innerHTML = State.papers.map((paper, idx) => {
    const paperId = getPaperId(paper.url);
    const isSelected = State.selectedPapers.has(paperId);
    const isBookmarked = State.bookmarks.some(b => b.url === paper.url);
    const iconType = getFileIconType(paper.fileType);
    const fileExt = getFileExt(paper.fileType);
    return `
      <div class="paper-card ${isSelected ? 'selected' : ''}" data-idx="${idx}" data-url="${escapeHtml(paper.url)}">
        <input type="checkbox" class="card-checkbox" data-idx="${idx}" ${isSelected ? 'checked' : ''}>
        <div class="paper-card-header">
          <div class="paper-file-icon ${iconType}" data-role="fileicon"><span class="file-type-label">${fileExt}</span></div>
          <div class="paper-card-title">${escapeHtml(paper.title)}</div>
        </div>
        <div class="paper-card-meta">
          ${paper.version ? `<span class="meta-tag version">${escapeHtml(paper.version)}</span>` : ''}
          ${paper.size ? `<span class="meta-tag size">${escapeHtml(paper.size)}</span>` : ''}
          ${paper.date ? `<span class="meta-tag date">${escapeHtml(paper.date)}</span>` : ''}
          ${paper.fileType ? `<span class="meta-tag" data-role="filetype">${escapeHtml(paper.fileType)}</span>` : ''}
        </div>
        <div class="paper-card-actions">
          <button class="card-btn btn-detail" data-idx="${idx}">详情</button>
          <button class="card-btn btn-download" data-idx="${idx}">下载</button>
          <button class="card-btn btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-idx="${idx}">
            ${isBookmarked ? '已收藏' : '收藏'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // 绑定事件
  $$('.paper-card .card-checkbox').forEach(cb => {
    cb.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(cb.dataset.idx, 10);
      const paper = State.papers[idx];
      const paperId = getPaperId(paper.url);
      if (cb.checked) {
        State.selectedPapers.add(paperId);
      } else {
        State.selectedPapers.delete(paperId);
      }
      cb.closest('.paper-card').classList.toggle('selected', cb.checked);
      updateSelectedCount();
    });
  });

  $$('.paper-card .btn-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDetail(parseInt(btn.dataset.idx, 10));
    });
  });

  $$('.paper-card .btn-download').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      await downloadPaper(State.papers[idx]);
    });
  });

  $$('.paper-card .btn-bookmark').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      toggleBookmark(State.papers[idx], btn);
    });
  });

  $$('.paper-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.idx, 10);
      showDetail(idx);
    });
  });

  updateSelectedCount();
  // 异步补全真实文件格式（网站元数据经常不准，如标 .doc 实为 .rar）
  enrichFileTypes(State.papers, '#paperList');
}

function updateSelectedCount() {
  $('#selectedCount').textContent = `已选 ${State.selectedPapers.size} 项`;
  const selectAll = $('#selectAllCheckbox');
  const allChecked = State.papers.length > 0 && State.papers.every(p => State.selectedPapers.has(getPaperId(p.url)));
  selectAll.checked = allChecked;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- 分页渲染 ----
function renderPagination() {
  const pagi = $('#pagination');
  if (State.totalPages <= 1) {
    pagi.style.display = 'none';
    return;
  }
  pagi.style.display = 'flex';
  $('#pageInfo').textContent = `${State.currentPage} / ${State.totalPages}`;
  $('#prevPage').disabled = State.currentPage <= 1;
  $('#nextPage').disabled = State.currentPage >= State.totalPages;
  $('#pageJumpInput').max = State.totalPages;
  $('#pageJumpInput').value = State.currentPage;
}

// ---- 详情弹窗 ----
async function showDetail(idx) {
  const paper = State.papers[idx];
  if (!paper) return;
  showLoading('正在获取试卷详情...');
  try {
    const detail = await apiGet(`/api/detail?url=${encodeURIComponent(paper.url)}`);
    const modal = $('#detailModal');
    $('#detailTitle').textContent = detail.title || paper.title;
    const isBookmarked = State.bookmarks.some(b => b.url === paper.url);
    const downloadUrl = detail.downloadUrl || '';
    const fileExt = downloadUrl ? downloadUrl.split('.').pop().split('?')[0] : (paper.fileType || '').replace('.', '');
    $('#detailBody').innerHTML = `
      <div class="detail-info-row"><span class="detail-info-label">编号 ID</span><span class="detail-info-value">${detail.id || '-'}</span></div>
      <div class="detail-info-row"><span class="detail-info-label">教材版本</span><span class="detail-info-value">${detail.version || paper.version || '-'}</span></div>
      <div class="detail-info-row"><span class="detail-info-label">资源类型</span><span class="detail-info-value">${detail.resourceType || '-'}</span></div>
      <div class="detail-info-row"><span class="detail-info-label">文件大小</span><span class="detail-info-value">${detail.size || paper.size || '-'}</span></div>
      <div class="detail-info-row"><span class="detail-info-label">文件类型</span><span class="detail-info-value">${detail.fileType || paper.fileType || '-'}</span></div>
      <div class="detail-info-row"><span class="detail-info-label">发布时间</span><span class="detail-info-value">${detail.publishDate || paper.date || '-'}</span></div>
      <div class="detail-info-row"><span class="detail-info-label">授权方式</span><span class="detail-info-value">${detail.license || '免费资源'}</span></div>
      ${detail.description ? `<div class="detail-description">${escapeHtml(detail.description)}</div>` : ''}
      <div class="detail-download-section">
        <div class="detail-download-label">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          下载地址
        </div>
        <div style="font-size:12px;color:var(--text-tertiary);word-break:break-all;margin-bottom:12px">${downloadUrl ? escapeHtml(downloadUrl) : '未找到下载链接'}</div>
        <div class="detail-actions">
          <button class="btn-primary" id="modalDownloadBtn" ${!downloadUrl ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载试卷
          </button>
          <button class="btn-secondary" id="modalBookmarkBtn">
            ${isBookmarked ? '取消收藏' : '加入收藏'}
          </button>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    $('#modalDownloadBtn').addEventListener('click', async () => {
      if (!downloadUrl) return;
      const paperWithDetail = { ...paper, title: detail.title || paper.title, downloadUrl, fileType: '.' + fileExt };
      await downloadPaper(paperWithDetail);
    });
    $('#modalBookmarkBtn').addEventListener('click', () => {
      toggleBookmark({ ...paper, title: detail.title || paper.title, downloadUrl }, null);
      $('#modalBookmarkBtn').textContent = isBookmarked ? '加入收藏' : '取消收藏';
    });
  } catch (e) {
    showToast('获取详情失败: ' + e.message);
  } finally {
    hideLoading();
  }
}

// ---- 下载试卷 ----
async function downloadPaper(paper) {
  let downloadUrl = paper.downloadUrl;
  let title = paper.title;
  let fileType = paper.fileType;

  // 如果没有直接下载链接，先获取详情页
  if (!downloadUrl) {
    showLoading('正在解析下载地址...');
    try {
      const detail = await apiGet(`/api/detail?url=${encodeURIComponent(paper.url)}`);
      downloadUrl = detail.downloadUrl;
      if (detail.title) title = detail.title;
      if (detail.fileType) fileType = detail.fileType;
    } catch (e) {
      hideLoading();
      showToast('解析下载地址失败: ' + e.message);
      return;
    } finally {
      hideLoading();
    }
  }

  if (!downloadUrl) {
    showToast('未找到下载链接');
    return;
  }

  // 构造文件名
  let fileName = title.replace(/[<>:"\\|?*\/]/g, '_').trim();
  // 始终以下载地址的扩展名为准（网站元数据中的 fileType 经常不准，如标 .doc 实为 .rar）
  let ext = '';
  const urlExtMatch = downloadUrl.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  if (urlExtMatch) {
    ext = '.' + urlExtMatch[1].toLowerCase();
  } else if (fileType) {
    ext = fileType.startsWith('.') ? fileType : '.' + fileType;
  } else {
    ext = '.file';
  }
  if (!fileName.toLowerCase().endsWith(ext.toLowerCase())) {
    fileName += ext;
  }

  // 添加到下载列表
  const downloadItem = {
    id: Date.now() + Math.random(),
    title: title,
    fileName: fileName,
    url: downloadUrl,
    sourceUrl: paper.url,
    status: 'downloading',
    progress: 0,
    filePath: '',
    size: 0,
    date: new Date().toISOString(),
  };
  State.downloads.unshift(downloadItem);
  saveDownloads();
  renderDownloadList();
  showToast('开始下载: ' + title);

  // 调用服务器保存文件
  try {
    const savePath = State.settings.savePath;
    const result = await apiGet(`/api/save-file?url=${encodeURIComponent(downloadUrl)}&path=${encodeURIComponent(savePath)}&name=${encodeURIComponent(fileName)}`);
    const item = State.downloads.find(d => d.id === downloadItem.id);
    if (item) {
      item.status = 'done';
      item.progress = 100;
      item.filePath = result.filePath;
      item.size = result.size;
      saveDownloads();
      renderDownloadList();
      showToast('下载完成: ' + title);
    }
  } catch (e) {
    const item = State.downloads.find(d => d.id === downloadItem.id);
    if (item) {
      item.status = 'failed';
      item.error = e.message;
      saveDownloads();
      renderDownloadList();
    }
    showToast('下载失败: ' + e.message);
  }
}

// ---- 批量下载 ----
async function batchDownload(papers, selectedIds) {
  const toDownload = papers.filter(p => selectedIds.has(getPaperId(p.url)));
  if (toDownload.length === 0) {
    showToast('请先选择试卷');
    return;
  }
  showToast(`开始批量下载 ${toDownload.length} 份试卷...`);
  for (const paper of toDownload) {
    await downloadPaper(paper);
  }
  showToast('批量下载完成');
  selectedIds.clear();
  renderPaperList();
}

// ---- 收藏管理 ----
function toggleBookmark(paper, btn) {
  const idx = State.bookmarks.findIndex(b => b.url === paper.url);
  if (idx >= 0) {
    State.bookmarks.splice(idx, 1);
    showToast('已取消收藏');
  } else {
    State.bookmarks.push({
      title: paper.title,
      url: paper.url,
      version: paper.version,
      size: paper.size,
      date: paper.date,
      fileType: paper.fileType,
      downloadUrl: paper.downloadUrl,
    });
    showToast('已加入收藏');
  }
  saveBookmarks();
  if (btn) {
    btn.classList.toggle('bookmarked');
    btn.textContent = idx >= 0 ? '收藏' : '已收藏';
  }
  // 刷新当前列表中的收藏状态
  if (State.papers.length > 0) renderPaperList();
  if (State.searchResults.length > 0) renderSearchResults();
}

function renderBookmarkList() {
  const list = $('#bookmarkList');
  if (State.bookmarks.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 120 120" width="80" height="80">
        <circle cx="60" cy="60" r="50" fill="var(--bg-secondary)"/>
        <path d="M45 35 L45 85 L60 72 L75 85 L75 35 Q75 32 72 32 L48 32 Q45 32 45 35 Z" fill="none" stroke="var(--text-tertiary)" stroke-width="2.5" stroke-linejoin="round"/>
      </svg>
      <p>暂无收藏</p>
    </div>`;
    $('#bookmarkDownloadAll').style.display = 'none';
    return;
  }
  $('#bookmarkDownloadAll').style.display = 'inline-flex';
  list.innerHTML = State.bookmarks.map((bm, idx) => {
    const iconType = getFileIconType(bm.fileType);
    const fileExt = getFileExt(bm.fileType);
    return `
      <div class="paper-card" data-idx="${idx}" style="cursor:default">
        <div class="paper-card-header">
          <div class="paper-file-icon ${iconType}"><span class="file-type-label">${fileExt}</span></div>
          <div class="paper-card-title">${escapeHtml(bm.title)}</div>
        </div>
        <div class="paper-card-meta">
          ${bm.version ? `<span class="meta-tag version">${escapeHtml(bm.version)}</span>` : ''}
          ${bm.size ? `<span class="meta-tag size">${escapeHtml(bm.size)}</span>` : ''}
          ${bm.date ? `<span class="meta-tag date">${escapeHtml(bm.date)}</span>` : ''}
        </div>
        <div class="paper-card-actions">
          <button class="card-btn bm-download" data-idx="${idx}">下载</button>
          <button class="card-btn bm-remove" data-idx="${idx}">移除</button>
        </div>
      </div>
    `;
  }).join('');

  $$('.bm-download').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      await downloadPaper(State.bookmarks[idx]);
    });
  });
  $$('.bm-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      State.bookmarks.splice(idx, 1);
      saveBookmarks();
      renderBookmarkList();
    });
  });
}

// ---- 下载列表渲染 ----
function renderDownloadList() {
  const list = $('#downloadList');
  if (State.downloads.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <svg viewBox="0 0 120 120" width="80" height="80">
        <circle cx="60" cy="60" r="50" fill="var(--bg-secondary)"/>
        <path d="M45 55 L45 85 Q45 92 52 92 L68 92 Q75 92 75 85 L75 55" fill="none" stroke="var(--text-tertiary)" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M55 65 L55 80 M60 65 L60 80 M65 65 L65 80" stroke="var(--text-tertiary)" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        <path d="M50 55 L50 48 Q50 40 60 40 Q70 40 70 48 L70 55" fill="none" stroke="var(--text-tertiary)" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <p>暂无下载记录</p>
    </div>`;
    return;
  }
  list.innerHTML = State.downloads.map((dl, idx) => {
    const statusText = dl.status === 'done' ? '已完成' : dl.status === 'downloading' ? '下载中...' : '下载失败';
    const statusColor = dl.status === 'done' ? '#34c759' : dl.status === 'downloading' ? 'var(--accent-primary)' : '#ff3b30';
    const iconType = getFileIconType(dl.fileName.split('.').pop());
    return `
      <div class="download-item" data-idx="${idx}">
        <div class="item-icon">
          <div class="paper-file-icon ${iconType}" style="width:32px;height:38px;border-radius:4px">
            <span class="file-type-label" style="font-size:8px">${dl.fileName.split('.').pop().toUpperCase()}</span>
          </div>
        </div>
        <div class="item-info">
          <div class="item-name">${escapeHtml(dl.title)}</div>
          <div class="item-status">
            <span style="color:${statusColor}">${statusText}</span>
            ${dl.size ? ` · ${formatSize(dl.size)}` : ''}
            ${dl.error ? ` · ${escapeHtml(dl.error)}` : ''}
            ${dl.status === 'downloading' ? `<div class="progress-bar"><div class="progress-fill" style="width:${dl.progress}%"></div></div>` : ''}
          </div>
        </div>
        <div class="item-actions">
          ${dl.status === 'done' ? `
            <button class="card-btn dl-open" data-idx="${idx}">打开</button>
            <button class="card-btn dl-reveal" data-idx="${idx}">定位</button>
          ` : ''}
          <button class="card-btn dl-delete" data-idx="${idx}">删除</button>
        </div>
      </div>
    `;
  }).join('');

  $$('.dl-open').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx, 10);
      try {
        await apiGet(`/api/open-file?path=${encodeURIComponent(State.downloads[idx].filePath)}`);
      } catch (e) { showToast('打开失败: ' + e.message); }
    });
  });
  $$('.dl-reveal').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx, 10);
      try {
        await apiGet(`/api/reveal-file?path=${encodeURIComponent(State.downloads[idx].filePath)}`);
      } catch (e) { showToast('定位失败: ' + e.message); }
    });
  });
  $$('.dl-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const dl = State.downloads[idx];
      if (dl.filePath && dl.status === 'done') {
        try { await apiGet(`/api/delete-file?path=${encodeURIComponent(dl.filePath)}`); } catch (e) {}
      }
      State.downloads.splice(idx, 1);
      saveDownloads();
      renderDownloadList();
    });
  });
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function updateDownloadBadge() {
  const badge = $('#downloadBadge');
  if (State.downloads.length > 0) {
    badge.textContent = State.downloads.length;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function updateBookmarkBadge() {
  const badge = $('#bookmarkBadge');
  if (State.bookmarks.length > 0) {
    badge.textContent = State.bookmarks.length;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

// ---- 搜索功能 ----
async function doSearch(keyword, page) {
  if (!keyword || !keyword.trim()) {
    showToast('请输入搜索关键词');
    return;
  }
  keyword = keyword.trim();
  const subject = $('#searchSubjectSelect').value;
  State.searchKeyword = keyword;
  State.searchPage = page || 1;
  State.searchSelected.clear();
  // 保存搜索历史
  if (!State.searchHistory) State.searchHistory = [];
  State.searchHistory = State.searchHistory.filter(k => k !== keyword);
  State.searchHistory.unshift(keyword);
  if (State.searchHistory.length > 20) State.searchHistory = State.searchHistory.slice(0, 20);
  saveSearchHistory();

  showLoading('正在深度搜索试卷（抓取多个分类页并过滤）...');
  try {
    const data = await apiGet(`/api/search?keyword=${encodeURIComponent(keyword)}&subject=${subject}&maxPages=3`);
    State.searchResults = data.items || [];
    State.searchTotalPages = data.totalPages || 1;
    State.totalItems = data.totalItems || State.searchResults.length;
    // 显示搜索范围信息
    const subjName = SUBJECTS[subject] ? SUBJECTS[subject].name : subject;
    $('#searchHint').textContent = `在${subjName}中找到 ${State.searchResults.length} 份匹配试卷`;
    renderSearchResults();
    renderSearchPagination();
  } catch (e) {
    showToast('搜索失败: ' + e.message);
    $('#searchResults').innerHTML = `<div class="empty-state"><p>搜索失败，请检查网络连接</p></div>`;
  } finally {
    hideLoading();
  }
}

function renderSearchResults() {
  const list = $('#searchResults');
  if (State.searchResults.length === 0) {
    list.innerHTML = `<div class="empty-state"><p>未找到相关试卷</p></div>`;
    $('#searchToolbar').style.display = 'none';
    return;
  }
  $('#searchToolbar').style.display = 'flex';
  list.innerHTML = State.searchResults.map((paper, idx) => {
    const paperId = getPaperId(paper.url);
    const isSelected = State.searchSelected.has(paperId);
    const isBookmarked = State.bookmarks.some(b => b.url === paper.url);
    const iconType = getFileIconType(paper.fileType);
    const fileExt = getFileExt(paper.fileType);
    return `
      <div class="paper-card ${isSelected ? 'selected' : ''}" data-idx="${idx}" data-url="${escapeHtml(paper.url)}">
        <input type="checkbox" class="card-checkbox" data-idx="${idx}" ${isSelected ? 'checked' : ''}>
        <div class="paper-card-header">
          <div class="paper-file-icon ${iconType}" data-role="fileicon"><span class="file-type-label">${fileExt}</span></div>
          <div class="paper-card-title">${escapeHtml(paper.title)}</div>
        </div>
        <div class="paper-card-meta">
          ${paper.subject ? `<span class="meta-tag version">${escapeHtml(paper.subject)}</span>` : ''}
          ${paper.grade ? `<span class="meta-tag version">${escapeHtml(paper.grade)}</span>` : ''}
          ${paper.version ? `<span class="meta-tag">${escapeHtml(paper.version)}</span>` : ''}
          ${paper.size ? `<span class="meta-tag size">${escapeHtml(paper.size)}</span>` : ''}
          ${paper.date ? `<span class="meta-tag date">${escapeHtml(paper.date)}</span>` : ''}
          ${paper.fileType ? `<span class="meta-tag" data-role="filetype">${escapeHtml(paper.fileType)}</span>` : ''}
        </div>
        <div class="paper-card-actions">
          <button class="card-btn s-detail" data-idx="${idx}">详情</button>
          <button class="card-btn s-download" data-idx="${idx}">下载</button>
          <button class="card-btn s-bookmark ${isBookmarked ? 'bookmarked' : ''}" data-idx="${idx}">
            ${isBookmarked ? '已收藏' : '收藏'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  $$('#searchResults .card-checkbox').forEach(cb => {
    cb.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(cb.dataset.idx, 10);
      const paperId = getPaperId(State.searchResults[idx].url);
      if (cb.checked) State.searchSelected.add(paperId);
      else State.searchSelected.delete(paperId);
      cb.closest('.paper-card').classList.toggle('selected', cb.checked);
      $('#searchSelectedCount').textContent = `已选 ${State.searchSelected.size} 项`;
    });
  });
  $$('#searchResults .s-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showSearchDetail(parseInt(btn.dataset.idx, 10));
    });
  });
  $$('#searchResults .s-download').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await downloadPaper(State.searchResults[parseInt(btn.dataset.idx, 10)]);
    });
  });
  $$('#searchResults .s-bookmark').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBookmark(State.searchResults[parseInt(btn.dataset.idx, 10)], btn);
    });
  });
  $$('#searchResults .paper-card').forEach(card => {
    card.addEventListener('click', () => {
      showSearchDetail(parseInt(card.dataset.idx, 10));
    });
  });
  $('#searchSelectedCount').textContent = `已选 ${State.searchSelected.size} 项`;
  // 异步补全真实文件格式
  enrichFileTypes(State.searchResults, '#searchResults');
}

async function showSearchDetail(idx) {
  // 复用浏览页详情逻辑，临时把 searchResults 当作 papers
  const tempPapers = State.papers;
  State.papers = State.searchResults;
  await showDetail(idx);
  State.papers = tempPapers;
}

function renderSearchPagination() {
  const pagi = $('#searchPagination');
  if (State.searchTotalPages <= 1) {
    pagi.style.display = 'none';
    return;
  }
  pagi.style.display = 'flex';
  $('#searchPageInfo').textContent = `${State.searchPage} / ${State.searchTotalPages}`;
  $('#searchPrevPage').disabled = State.searchPage <= 1;
  $('#searchNextPage').disabled = State.searchPage >= State.searchTotalPages;
}

// ---- 搜索历史 ----
function renderSearchHistory() {
  const sh = $('#searchHistory');
  if (!State.searchHistory || State.searchHistory.length === 0) {
    sh.style.display = 'none';
    return;
  }
  sh.style.display = 'block';
  sh.innerHTML = `
    <div class="sh-header">
      <span>搜索历史</span>
      <span class="sh-clear" id="shClear">清空</span>
    </div>
    ${State.searchHistory.map(k => `
      <div class="sh-item">
        <span class="sh-text">${escapeHtml(k)}</span>
        <span class="sh-remove" data-key="${escapeHtml(k)}">×</span>
      </div>
    `).join('')}
  `;
  $('#shClear').addEventListener('click', () => {
    State.searchHistory = [];
    saveSearchHistory();
    renderSearchHistory();
  });
  $$('.sh-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('sh-remove')) {
        e.stopPropagation();
        const key = e.target.dataset.key;
        State.searchHistory = State.searchHistory.filter(k => k !== key);
        saveSearchHistory();
        renderSearchHistory();
      } else {
        const keyword = item.querySelector('.sh-text').textContent;
        $('#searchInput').value = keyword;
        doSearch(keyword);
        $('#searchHistory').style.display = 'none';
      }
    });
  });
}

// ---- 磁盘空间查询 ----
async function updateDiskInfo() {
  try {
    const data = await apiGet(`/api/disk-space?path=${encodeURIComponent(State.settings.savePath)}`);
    if (data.free != null) {
      $('#diskFreeInfo').textContent = '可用空间: ' + formatSize(data.free);
    }
  } catch (e) { /* 忽略 */ }
}

// ---- 事件绑定 ----
function bindEvents() {
  // 侧边栏导航
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      switchPage(page);
      if (page === 'downloads') renderDownloadList();
      if (page === 'bookmarks') renderBookmarkList();
      if (page === 'settings') updateDiskInfo();
    });
  });

  // 主题切换
  $$('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });

  // 分页按钮
  $('#prevPage').addEventListener('click', () => {
    if (State.currentPage > 1) { State.currentPage--; loadPaperList(); }
  });
  $('#nextPage').addEventListener('click', () => {
    if (State.currentPage < State.totalPages) { State.currentPage++; loadPaperList(); }
  });
  $('#pageJumpBtn').addEventListener('click', () => {
    const p = parseInt($('#pageJumpInput').value, 10);
    if (p >= 1 && p <= State.totalPages) { State.currentPage = p; loadPaperList(); }
  });
  $('#pageJumpInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#pageJumpBtn').click();
  });

  // 全选/反选
  $('#selectAllCheckbox').addEventListener('change', (e) => {
    const checked = e.target.checked;
    State.papers.forEach(p => {
      const pid = getPaperId(p.url);
      if (checked) State.selectedPapers.add(pid);
      else State.selectedPapers.delete(pid);
    });
    renderPaperList();
  });
  $('#invertSelectBtn').addEventListener('click', () => {
    State.papers.forEach(p => {
      const pid = getPaperId(p.url);
      if (State.selectedPapers.has(pid)) State.selectedPapers.delete(pid);
      else State.selectedPapers.add(pid);
    });
    renderPaperList();
  });
  $('#batchDownloadBtn').addEventListener('click', () => {
    batchDownload(State.papers, State.selectedPapers);
  });

  // 搜索
  $('#searchBtn').addEventListener('click', () => {
    doSearch($('#searchInput').value);
  });
  $('#searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      doSearch($('#searchInput').value);
      $('#searchHistory').style.display = 'none';
    }
  });
  $('#searchInput').addEventListener('focus', () => {
    renderSearchHistory();
  });
  $('#searchInput').addEventListener('blur', () => {
    setTimeout(() => { $('#searchHistory').style.display = 'none'; }, 200);
  });

  // 搜索分页
  $('#searchPrevPage').addEventListener('click', () => {
    if (State.searchPage > 1) doSearch(State.searchKeyword, State.searchPage - 1);
  });
  $('#searchNextPage').addEventListener('click', () => {
    if (State.searchPage < State.searchTotalPages) doSearch(State.searchKeyword, State.searchPage + 1);
  });

  // 搜索全选/批量
  $('#searchSelectAllCheckbox').addEventListener('change', (e) => {
    const checked = e.target.checked;
    State.searchResults.forEach(p => {
      const pid = getPaperId(p.url);
      if (checked) State.searchSelected.add(pid);
      else State.searchSelected.delete(pid);
    });
    renderSearchResults();
  });
  $('#searchInvertSelectBtn').addEventListener('click', () => {
    State.searchResults.forEach(p => {
      const pid = getPaperId(p.url);
      if (State.searchSelected.has(pid)) State.searchSelected.delete(pid);
      else State.searchSelected.add(pid);
    });
    renderSearchResults();
  });
  $('#searchBatchDownloadBtn').addEventListener('click', () => {
    batchDownload(State.searchResults, State.searchSelected);
  });

  // 弹窗关闭
  $('#modalClose').addEventListener('click', () => {
    $('#detailModal').style.display = 'none';
  });
  $('#detailModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailModal') $('#detailModal').style.display = 'none';
  });

  // 下载管理 - 清空
  $('#clearDownloads').addEventListener('click', () => {
    if (State.downloads.length === 0) return;
    if (!confirm('确定清空所有下载记录？已下载的文件也会被删除。')) return;
    State.downloads.forEach(async dl => {
      if (dl.filePath && dl.status === 'done') {
        try { await apiGet(`/api/delete-file?path=${encodeURIComponent(dl.filePath)}`); } catch (e) {}
      }
    });
    State.downloads = [];
    saveDownloads();
    renderDownloadList();
    showToast('已清空下载记录');
  });

  // 收藏 - 全部下载
  $('#bookmarkDownloadAll').addEventListener('click', async () => {
    if (State.bookmarks.length === 0) return;
    showToast(`开始下载 ${State.bookmarks.length} 份收藏试卷...`);
    for (const bm of State.bookmarks) {
      await downloadPaper(bm);
    }
    showToast('收藏试卷下载完成');
  });

  // 设置
  $('#savePathInput').addEventListener('change', (e) => {
    State.settings.savePath = e.target.value;
    saveSettings();
    updateDiskInfo();
    showToast('保存路径已更新');
  });
  $('#timeoutInput').addEventListener('change', (e) => {
    State.settings.timeout = parseInt(e.target.value, 10) || 60;
    saveSettings();
  });
  $('#themeSelect').addEventListener('change', (e) => {
    setTheme(e.target.value);
  });
  $('#browseFolderBtn').addEventListener('click', async () => {
    try {
      const data = await apiGet('/api/browse-folder');
      if (data.path) {
        $('#savePathInput').value = data.path;
        State.settings.savePath = data.path;
        saveSettings();
        updateDiskInfo();
        showToast('已选择保存路径');
      }
    } catch (e) {
      showToast('打开文件夹选择器失败: ' + e.message);
    }
  });
}

// ---- 初始化 ----
function init() {
  loadState();
  setTheme(State.settings.theme || 'light');
  // 恢复设置 UI
  $('#savePathInput').value = State.settings.savePath;
  $('#timeoutInput').value = State.settings.timeout;
  $('#themeSelect').value = State.settings.theme;

  renderSubjectGrid();
  bindEvents();
  updateDownloadBadge();
  updateBookmarkBadge();
  updateDiskInfo();
}

document.addEventListener('DOMContentLoaded', init);
