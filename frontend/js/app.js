// Check auth
if (!localStorage.getItem('bot_admin_logged')) {
  window.location.href = 'login.html';
}

// State
let currentPage = 'dashboard';
let waGroupsMap = new Map(); // JID -> {id, name, participants}

// Init
document.addEventListener('DOMContentLoaded', () => {
  try { initSocket(); } catch (err) { console.warn('Socket init failed:', err.message); }
  try { loadPage('dashboard'); } catch (err) { console.error('Dashboard load failed:', err.message); }
  initNav();
  initModal();
  loadTargetGroups();
  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('bot_admin_logged');
    window.location.href = 'login.html';
  });
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  // Hide QR container by default (only shown in Settings)
  const qrContainer = document.getElementById('qrContainer');
  if (qrContainer) qrContainer.style.display = 'none';
});

// Store target groups as Map for quick lookup: JID -> {id, name}
let targetGroupsMap = new Map();

async function loadTargetGroups() {
  try {
    const [settingsRes, waGroupsRes] = await Promise.all([
      api.get('/settings'),
      api.get('/settings/wa/groups')
    ]);
    const savedTargets = settingsRes.data?.target_groups || [];
    const waGroups = waGroupsRes.data || [];
    
    // Build map of all WA groups (JID -> {id, name, participants})
    waGroupsMap.clear();
    waGroups.forEach(g => {
      waGroupsMap.set(g.id, { id: g.id, name: g.name, participants: g.participants });
    });
    
    // Build target groups map from saved targets (using WA group names if available)
    targetGroupsMap.clear();
    savedTargets.forEach(jid => {
      const waGroup = waGroupsMap.get(jid);
      targetGroupsMap.set(jid, {
        id: jid,
        name: waGroup ? waGroup.name : jid,
        participants: waGroup ? waGroup.participants : 0
      });
    });
    
    console.log('[App] Target groups loaded:', Array.from(targetGroupsMap.values()));
  } catch (err) {
    console.warn('[App] Failed to load target groups:', err.message);
    targetGroupsMap.clear();
  }
}

function getTargetGroupOptions() {
  return Array.from(targetGroupsMap.values()).map(g => 
    `<option value="${g.id}">${g.name} (JID: ${g.id})</option>`
  ).join('');
}

function getTargetGroupCheckboxes(savedTargets = []) {
  return Array.from(waGroupsMap.values()).map(g => `
    <label style="display:flex;align-items:center;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--card);cursor:pointer;gap:10px;transition:all 0.2s;" 
           onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
      <input type="checkbox" name="target_group" value="${g.id}" ${savedTargets.includes(g.id) ? 'checked' : ''} 
             style="width:18px;height:18px;accent-color:var(--primary);">
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${g.name}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">JID: ${g.id}</div>
        <div style="font-size:11px;color:var(--text-muted);">👥 ${g.participants} anggota</div>
      </div>
    </label>
  `).join('');
}

function toggleQRContainer(show) {
  const qrContainer = document.getElementById('qrContainer');
  if (qrContainer) {
    qrContainer.style.display = show ? 'block' : 'none';
  }
}

function initNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      try { loadPage(el.dataset.page); } catch (err) { console.error('Page load failed:', err.message); }
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
}

function openModal(title, bodyHTML, footerHTML = '') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalFooter').innerHTML = footerHTML;
  document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function loadPage(page) {
  currentPage = page;
  const area = document.getElementById('contentArea');
  document.getElementById('pageTitle').textContent = getPageTitle(page);

  // Show QR container only on Settings page
  toggleQRContainer(page === 'settings');

  const loaders = {
    dashboard: loadDashboard,
    matkul: loadMatkul,
    jadwal: loadJadwal,
    pengumuman: loadPengumuman,
    tugas: loadTugas,
    mahasiswa: loadMahasiswa,
    'titip-absen': loadTitipAbsen,
    rangkuman: loadRangkuman,
    settings: loadSettings,
  };

  if (loaders[page]) await loaders[page](area);
}

function getPageTitle(page) {
  const titles = {
    dashboard: 'Dashboard', matkul: 'Mata Kuliah', jadwal: 'Jadwal Kuliah',
    pengumuman: 'Pengumuman', tugas: 'Tugas & Deadline', mahasiswa: 'Mahasiswa',
    'titip-absen': 'Titip Absen', rangkuman: 'Rangkuman', settings: 'Pengaturan',
  };
  return titles[page] || 'Dashboard';
}

// ============ DASHBOARD ============
async function loadDashboard(area) {
  const res = await api.get('/dashboard/stats');
  const d = res.data;
  area.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><h3>Mata Kuliah</h3><div class="stat-value">${d.matkul}</div></div>
      <div class="stat-card"><h3>Jadwal</h3><div class="stat-value">${d.jadwal}</div></div>
      <div class="stat-card"><h3>Pengumuman</h3><div class="stat-value">${d.pengumuman}</div></div>
      <div class="stat-card"><h3>Tugas Aktif</h3><div class="stat-value">${d.tugasAktif}</div></div>
      <div class="stat-card"><h3>Mahasiswa</h3><div class="stat-value">${d.mahasiswa}</div></div>
      <div class="stat-card"><h3>Rangkuman</h3><div class="stat-value">${d.rangkuman}</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h2>📅 Jadwal Hari Ini</h2></div>
      <div class="card-body">
        ${d.jadwalHariIni.length ? `<table><thead><tr><th>Mata Kuliah</th><th>Jam</th><th>Google Meet</th></tr></thead><tbody>
          ${d.jadwalHariIni.map(j => `<tr><td>${j.matkul_id?.nama || '-'}</td><td>${j.jam_mulai} - ${j.jam_selesai}</td><td><a href="${j.gmeet_link || j.matkul_id?.gmeet_link || '#'}" target="_blank">Join</a></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>Tidak ada jadwal hari ini</p></div>'}
      </div>
    </div>`;
}

// ============ MATKUL ============
async function loadMatkul(area) {
  const res = await api.get('/matkul');
  const data = res.data || [];
  area.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>📚 Daftar Mata Kuliah</h2><button class="btn btn-primary btn-sm" onclick="showFormMatkul()">+ Tambah</button></div>
      <div class="card-body"><div class="table-wrapper">
        ${data.length ? `<table><thead><tr><th>Kode</th><th>Nama</th><th>SKS</th><th>Dosen</th><th>Google Meet</th><th>Aksi</th></tr></thead><tbody>
          ${data.map(m => `<tr><td>${m.kode}</td><td>${m.nama}</td><td>${m.sks}</td><td>${m.dosen || '-'}</td><td>${m.gmeet_link ? '<a href="'+m.gmeet_link+'" target="_blank">Link</a>' : '-'}</td>
          <td><button class="btn btn-primary btn-sm" onclick="editMatkul('${m._id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="deleteMatkul('${m._id}')">Hapus</button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>Belum ada mata kuliah</p></div>'}
      </div></div>`;
}

function showFormMatkul(data = null) {
  const isEdit = !!data;
  openModal(isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah', `
    <form id="formMatkul">
      <div class="form-row">
        <div class="form-group"><label>Kode</label><input name="kode" value="${data?.kode || ''}" required></div>
        <div class="form-group"><label>SKS</label><input type="number" name="sks" value="${data?.sks || 0}"></div>
      </div>
      <div class="form-group"><label>Nama</label><input name="nama" value="${data?.nama || ''}" required></div>
      <div class="form-group"><label>Dosen</label><input name="dosen" value="${data?.dosen || ''}"></div>
      <div class="form-group"><label>Google Meet Link</label><input name="gmeet_link" value="${data?.gmeet_link || ''}"></div>
    </form>`, `
    <button class="btn btn-primary" onclick="saveMatkul(${isEdit ? `'${data._id}'` : 'null'})">Simpan</button>
    <button class="btn btn-danger" onclick="closeModal()">Batal</button>`);
}

async function saveMatkul(id) {
  const form = document.getElementById('formMatkul');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  data.sks = Number(data.sks);
  if (id) await api.put(`/matkul/${id}`, data);
  else await api.post('/matkul', data);
  closeModal(); showToast('Mata kuliah tersimpan'); loadMatkul(document.getElementById('contentArea'));
}

async function editMatkul(id) {
  const res = await api.get(`/matkul/${id}`);
  showFormMatkul(res.data);
}

async function deleteMatkul(id) {
  if (!confirm('Hapus mata kuliah ini?')) return;
  await api.delete(`/matkul/${id}`);
  showToast('Mata kuliah dihapus'); loadMatkul(document.getElementById('contentArea'));
}

// ============ JADWAL ============
async function loadJadwal(area) {
  const [jadwalRes, matkulRes] = await Promise.all([api.get('/jadwal'), api.get('/matkul')]);
  const data = jadwalRes.data || [];
  const matkuls = matkulRes.data || [];
  area.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>📅 Jadwal Kuliah</h2><button class="btn btn-primary btn-sm" onclick="showFormJadwal(null, window._matkuls)">+ Tambah</button></div>
      <div class="card-body"><div class="table-wrapper">
        ${data.length ? `<table><thead><tr><th>Mata Kuliah</th><th>Hari</th><th>Jam</th><th>Google Meet</th><th>WA Group</th><th>Aksi</th></tr></thead><tbody>
          ${data.map(j => `<tr><td>${j.matkul_id?.nama || '-'}</td><td>${j.hari}</td><td>${j.jam_mulai} - ${j.jam_selesai}</td><td>${j.gmeet_link ? '<a href="'+j.gmeet_link+'" target="_blank" class="btn btn-sm" style="padding:4px 8px;font-size:11px;">GMeet</a>' : '<span class="badge badge-danger">-</span>'}</td><td>${j.wa_group_link ? '<a href="'+j.wa_group_link+'" target="_blank" class="btn btn-success btn-sm" style="padding:4px 8px;font-size:11px;">WAG</a>' : '<span class="badge badge-danger">-</span>'}</td>
          <td><button class="btn btn-primary btn-sm" onclick="editJadwal('${j._id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="deleteJadwal('${j._id}')">Hapus</button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>Belum ada jadwal</p></div>'}
      </div></div>`;

  window._matkuls = matkuls;
}

function showFormJadwal(data, matkuls) {
  const isEdit = !!data;
  const matkulOpts = (matkuls || window._matkuls || []).map(m => `<option value="${m._id}" ${data?.matkul_id === m._id || data?.matkul_id?._id === m._id ? 'selected' : ''}>${m.nama}</option>`).join('');
  const hariOpts = ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'].map(h => `<option value="${h}" ${data?.hari === h ? 'selected' : ''}>${h}</option>`).join('');
  openModal(isEdit ? 'Edit Jadwal' : 'Tambah Jadwal', `
    <form id="formJadwal">
      <div class="form-group"><label>Mata Kuliah</label><select name="matkul_id">${matkulOpts}</select></div>
      <div class="form-group"><label>Hari</label><select name="hari">${hariOpts}</select></div>
      <div class="form-row">
        <div class="form-group"><label>Jam Mulai</label><input type="time" name="jam_mulai" value="${data?.jam_mulai || ''}" required></div>
        <div class="form-group"><label>Jam Selesai</label><input type="time" name="jam_selesai" value="${data?.jam_selesai || ''}" required></div>
      </div>
      <div class="form-group"><label>Google Meet Link</label><input name="gmeet_link" value="${data?.gmeet_link || ''}"></div>
      <div class="form-group"><label>WA Group Link</label><input name="wa_group_link" value="${data?.wa_group_link || ''}"></div>
    </form>`, `
    <button class="btn btn-primary" onclick="saveJadwal(${isEdit ? `'${data._id}'` : 'null'})">Simpan</button>
    <button class="btn btn-danger" onclick="closeModal()">Batal</button>`);
}

async function saveJadwal(id) {
  const form = document.getElementById('formJadwal');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  if (id) await api.put(`/jadwal/${id}`, data);
  else await api.post('/jadwal', data);
  closeModal(); showToast('Jadwal tersimpan'); loadJadwal(document.getElementById('contentArea'));
}

async function editJadwal(id) {
  const res = await api.get(`/jadwal/${id}`);
  showFormJadwal(res.data);
}

async function deleteJadwal(id) {
  if (!confirm('Hapus jadwal ini?')) return;
  await api.delete(`/jadwal/${id}`);
  showToast('Jadwal dihapus'); loadJadwal(document.getElementById('contentArea'));
}

// ============ PENGUMUMAN ============
async function loadPengumuman(area) {
  const res = await api.get('/pengumuman');
  const data = res.data || [];
  area.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>📢 Pengumuman</h2>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" onclick="manualSyncPengumuman()">🔄 Sync dari Google Sheets</button>
          <button class="btn btn-primary btn-sm" onclick="showFormPengumuman()">+ Tambah</button>
        </div>
      </div>
      <div class="card-body"><div class="table-wrapper">
        ${data.length ? `<table><thead><tr><th>Judul</th><th>Isi</th><th>Status</th><th>Berulang</th><th>Aksi</th></tr></thead><tbody>
          ${data.map(p => `<tr><td>${p.judul}</td><td>${p.isi.substring(0, 50)}...</td><td><span class="badge ${p.is_active ? 'badge-success' : 'badge-danger'}">${p.is_active ? 'Aktif' : 'Nonaktif'}</span></td><td>${p.is_recurring ? 'Ya' : 'Tidak'}</td>
          <td><button class="btn btn-success btn-sm" onclick="dispatchPengumuman('${p._id}')">Kirim</button> <button class="btn btn-primary btn-sm" onclick="editPengumuman('${p._id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="deletePengumuman('${p._id}')">Hapus</button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>Belum ada pengumuman</p></div>'}
      </div></div>`;
}

function showFormPengumuman(data = null) {
  const isEdit = !!data;
  const savedTargets = data?.target_group_ids || [];
  openModal(isEdit ? 'Edit Pengumuman' : 'Tambah Pengumuman', `
    <form id="formPengumuman">
      <div class="form-group"><label>Judul</label><input name="judul" value="${data?.judul || ''}" required></div>
      <div class="form-group"><label>Isi Pengumuman</label><textarea name="isi" required style="min-height:100px">${data?.isi || ''}</textarea></div>
      
      <div class="form-group">
        <label>Target Grup Broadcast</label>
        <select name="target_group_ids" multiple style="min-height:120px;">
          <option value="" disabled>Pilih grup target (Ctrl+Click untuk multi-select)</option>
          ${getTargetGroupOptions().replace(/<option value="([^"]+)">([^<]+)<\/option>/g, (match, value, label) => 
            `<option value="${value}" ${savedTargets.includes(value) ? 'selected' : ''}>${label}</option>`
          )}
        </select>
        <small style="color:var(--text-muted);display:block;margin-top:4px;">Tahan Ctrl/Cmd untuk memilih multiple grup. Kelola grup di menu Pengaturan → Target Grup Broadcast.</small>
      </div>
      
      <div class="card" style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:8px;">
        <h4 style="margin-bottom:12px;color:var(--primary)">🔄 Pengaturan Pengumuman Berulang (Otomatis)</h4>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Aktifkan untuk pengiriman otomatis berkala (misal: Google Forms Titip Absen harian/jadwal)</p>
        <div class="form-row">
          <div class="form-group"><label>Berulang (Recurring)</label><select name="is_recurring"><option value="false" ${!data?.is_recurring ? 'selected' : ''}>Tidak</option><option value="true" ${data?.is_recurring ? 'selected' : ''}>Ya</option></select></div>
          <div class="form-group"><label>Jam Kirim (HH:mm)</label><input type="time" name="schedule_time" value="${data?.schedule_time || ''}"></div>
        </div>
        <div class="form-group"><label>Hari Ulang (pisah koma: senin,selasa,rabu,kamis,jumat,sabtu,minggu)</label><input name="repeat_days" value="${(data?.repeat_days || []).join(', ')}" placeholder="senin,selasa,rabu,kamis,jumat"></div>
      </div>
      
      <div class="form-group"><label>Status</label><select name="is_active"><option value="true" ${data?.is_active !== false ? 'selected' : ''}>Aktif</option><option value="false" ${data?.is_active === false ? 'selected' : ''}>Nonaktif</option></select></div>
    </form>`, `
    <button class="btn btn-primary" onclick="savePengumuman(${isEdit ? `'${data._id}'` : 'null'})">Simpan</button>
    <button class="btn btn-danger" onclick="closeModal()">Batal</button>`);
}

async function savePengumuman(id) {
  const form = document.getElementById('formPengumuman');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  data.target_group_ids = fd.getAll('target_group_ids').filter(Boolean);
  data.repeat_days = data.repeat_days.split(',').map(s => s.trim()).filter(Boolean);
  data.is_recurring = data.is_recurring === 'true';
  data.is_active = data.is_active === 'true';
  if (id) await api.put(`/pengumuman/${id}`, data);
  else await api.post('/pengumuman', data);
  closeModal(); showToast('Pengumuman tersimpan & otomatis dikirim ke grup WA!'); loadPengumuman(document.getElementById('contentArea'));
}

async function editPengumuman(id) {
  const res = await api.get(`/pengumuman/${id}`);
  showFormPengumuman(res.data);
}

async function deletePengumuman(id) {
  if (!confirm('Hapus pengumuman ini?')) return;
  await api.delete(`/pengumuman/${id}`);
  showToast('Pengumuman dihapus'); loadPengumuman(document.getElementById('contentArea'));
}

async function dispatchPengumuman(id) {
  if (!confirm('Kirim pengumuman ini ke grup WhatsApp?')) return;
  // Get selected target groups from form if in edit modal, or use saved targets
  const form = document.getElementById('formPengumuman');
  let targetGroups = [];
  if (form) {
    const select = form.querySelector('select[name="target_group_ids"]');
    if (select) {
      targetGroups = Array.from(select.selectedOptions).map(opt => opt.value);
    }
  }
  const res = await api.post(`/pengumuman/${id}/dispatch`, { target_group_ids: targetGroups });
  showToast(res.message || 'Selesai', res.success ? 'success' : 'error');
}

async function manualSyncPengumuman() {
  showToast('Sedang sync data pengumuman dari server...', 'info');
  try {
    const res = await api.get('/pengumuman');
    const data = res.data || [];
    const area = document.getElementById('contentArea');
    if (area) loadPengumuman(area);
    showToast(`Sync berhasil! ${data.length} pengumuman dimuat ulang.`, 'success');
  } catch (err) {
    showToast('Gagal sync pengumuman: ' + (err.message || 'Unknown error'), 'error');
  }
}

// ============ TUGAS ============
async function loadTugas(area) {
  const [tugasRes, matkulRes] = await Promise.all([api.get('/tugas'), api.get('/matkul')]);
  const data = tugasRes.data || [];
  const matkuls = matkulRes.data || [];
  area.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>📝 Tugas & Deadline</h2>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" onclick="manualSyncTugas()">🔄 Sync dari Google Sheets</button>
          <button class="btn btn-primary btn-sm" onclick="showFormTugas(null, window._matkuls)">+ Tambah</button>
        </div>
      </div>
      <div class="card-body"><div class="table-wrapper">
        ${data.length ? `<table><thead><tr><th>Mata Kuliah</th><th>Judul</th><th>Deadline</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
          ${data.map(t => `<tr><td>${t.matkul_id?.nama || '-'}</td><td>${t.judul}</td><td>${new Date(t.deadline).toLocaleString('id-ID')}</td><td><span class="badge ${t.status === 'aktif' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
          <td><button class="btn btn-success btn-sm" onclick="dispatchTugas('${t._id}')">Kirim</button> <button class="btn btn-primary btn-sm" onclick="editTugas('${t._id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="deleteTugas('${t._id}')">Hapus</button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>Belum ada tugas</p></div>'}
      </div></div>`;

  window._matkuls = matkuls;
}

function showFormTugas(data, matkuls) {
  const isEdit = !!data;
  const matkulOpts = (matkuls || window._matkuls || []).map(m => `<option value="${m._id}" ${data?.matkul_id === m._id || data?.matkul_id?._id === m._id ? 'selected' : ''}>${m.nama}</option>`).join('');
  const deadlineStr = data?.deadline ? new Date(data.deadline).toISOString().slice(0, 16) : '';
  const savedTargets = data?.target_group_ids || [];
  openModal(isEdit ? 'Edit Tugas' : 'Tambah Tugas', `
    <form id="formTugas">
      <div class="form-group"><label>Mata Kuliah</label><select name="matkul_id">${matkulOpts}</select></div>
      <div class="form-group"><label>Judul Tugas</label><input name="judul" value="${data?.judul || ''}" required placeholder="Contoh: Tugas 1 Kalkulus - Limit Fungsi"></div>
      <div class="form-group"><label>Deskripsi Detail Tugas</label><textarea name="deskripsi" style="min-height:100px" placeholder="Deskripsi lengkap tugas, referensi, format pengumpulan, dll.">${data?.deskripsi || ''}</textarea></div>
      <div class="form-group"><label>Tanggal & Jam Deadline</label><input type="datetime-local" name="deadline" value="${deadlineStr}" required></div>
      <div class="form-group"><label>Status Tugas</label><select name="status"><option value="aktif" ${data?.status === 'aktif' || !data ? 'selected' : ''}>Aktif</option><option value="selesai" ${data?.status === 'selesai' ? 'selected' : ''}>Selesai</option></select></div>
      
      <div class="form-group">
        <label>Target Grup Broadcast (Reminder)</label>
        <select name="target_group_ids" multiple style="min-height:120px;">
          <option value="" disabled>Pilih grup target reminder (Ctrl+Click untuk multi-select)</option>
          ${getTargetGroupOptions().replace(/<option value="([^"]+)">([^<]+)<\/option>/g, (match, value, label) => 
            `<option value="${value}" ${savedTargets.includes(value) ? 'selected' : ''}>${label}</option>`
          )}
        </select>
        <small style="color:var(--text-muted);display:block;margin-top:4px;">Grup yang akan menerima reminder tugas (H-3, H-1, H-0). Kelola di menu Pengaturan.</small>
      </div>
    </form>`, `
    <button class="btn btn-primary" onclick="saveTugas(${isEdit ? `'${data._id}'` : 'null'})">Simpan</button>
    <button class="btn btn-danger" onclick="closeModal()">Batal</button>`);
}

async function saveTugas(id) {
  const form = document.getElementById('formTugas');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  data.target_group_ids = fd.getAll('target_group_ids').filter(Boolean);
  if (id) await api.put(`/tugas/${id}`, data);
  else await api.post('/tugas', data);
  closeModal(); showToast('Tugas tersimpan & otomatis dikirim ke grup WA!'); loadTugas(document.getElementById('contentArea'));
}

async function editTugas(id) {
  const res = await api.get(`/tugas/${id}`);
  showFormTugas(res.data);
}

async function deleteTugas(id) {
  if (!confirm('Hapus tugas ini?')) return;
  await api.delete(`/tugas/${id}`);
  showToast('Tugas dihapus'); loadTugas(document.getElementById('contentArea'));
}

async function dispatchTugas(id) {
  if (!confirm('Kirim reminder tugas ke grup WhatsApp?')) return;
  // Get selected target groups from form if in edit modal
  const form = document.getElementById('formTugas');
  let targetGroups = [];
  if (form) {
    const select = form.querySelector('select[name="target_group_ids"]');
    if (select) {
      targetGroups = Array.from(select.selectedOptions).map(opt => opt.value);
    }
  }
  const res = await api.post(`/tugas/${id}/dispatch`, { target_group_ids: targetGroups });
  showToast(res.message || 'Selesai', res.success ? 'success' : 'error');
}

async function manualSyncTugas() {
  showToast('Sedang sync data tugas dari server...', 'info');
  try {
    const res = await api.get('/tugas');
    const data = res.data || [];
    const area = document.getElementById('contentArea');
    if (area) loadTugas(area);
    showToast(`Sync berhasil! ${data.length} tugas dimuat ulang.`, 'success');
  } catch (err) {
    showToast('Gagal sync tugas: ' + (err.message || 'Unknown error'), 'error');
  }
}

// ============ MAHASISWA ============
async function loadMahasiswa(area) {
  const res = await api.get('/mahasiswa');
  const data = (res.data || []).sort((a, b) => {
    const suffixA = parseInt(String(a.nim).split('.').pop() || '0', 10);
    const suffixB = parseInt(String(b.nim).split('.').pop() || '0', 10);
    return suffixA - suffixB;
  });
  data.forEach((m, i) => { m.nomor = i + 1; });
  window._mahasiswaData = data;

  area.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>👥 Data Mahasiswa</h2>
        <div class="btn-group">
          <button class="btn btn-success btn-sm" onclick="showImportMahasiswa()">📂 Import Excel</button>
          <button class="btn btn-primary btn-sm" onclick="showFormMahasiswa()">+ Tambah</button>
        </div>
      </div>
      <div class="card-body">
        <div class="row mb-3 align-items-center">
          <div class="col-md-8">
            <input type="text" id="searchMahasiswa" class="form-control" placeholder="🔍 Cari berdasarkan NIM, Nama, atau WhatsApp..." oninput="filterMahasiswaTable()" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:8px;font-size:14px;">
          </div>
          <div class="col-md-4 text-end">
            <button class="btn btn-outline-primary" onclick="manualSyncMahasiswa()" style="white-space:nowrap;">🔄 Sync dari Google Sheets</button>
          </div>
        </div>
        <div class="table-wrapper" id="mahasiswaTableWrapper">
          ${renderMahasiswaTable(data)}
        </div>
      </div></div>`;
}

function filterMahasiswaTable() {
  const q = document.getElementById('searchMahasiswa').value.toLowerCase().trim();
  const filtered = window._mahasiswaData.filter(m =>
    (m.nim || '').toLowerCase().includes(q) ||
    (m.nama || '').toLowerCase().includes(q) ||
    (m.wa || '').toLowerCase().includes(q)
  );
  document.getElementById('mahasiswaTableWrapper').innerHTML = renderMahasiswaTable(filtered);
}

function renderMahasiswaTable(data) {
  if (!data.length) return '<div class="empty-state"><p>Tidak ada data mahasiswa yang cocok</p></div>';
  return `<table><thead><tr><th>No</th><th>Nama</th><th>NIM</th><th>WhatsApp</th><th>Aksi</th></tr></thead><tbody>
    ${data.map((m, i) => `<tr><td>${i + 1}</td><td>${m.nama}</td><td>${m.nim}</td><td>${m.wa}</td>
    <td><button class="btn btn-primary btn-sm" onclick="editMahasiswa('${m._id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="deleteMahasiswa('${m._id}')">Hapus</button></td></tr>`).join('')}
  </tbody></table>`;
}

async function manualSyncMahasiswa() {
  showToast('Sedang sync data dari server...', 'info');
  try {
    const res = await api.get('/mahasiswa');
    const data = (res.data || []).sort((a, b) => {
      const suffixA = parseInt(String(a.nim).split('.').pop() || '0', 10);
      const suffixB = parseInt(String(b.nim).split('.').pop() || '0', 10);
      return suffixA - suffixB;
    });
    data.forEach((m, i) => { m.nomor = i + 1; });
    window._mahasiswaData = data;

    const tableWrapper = document.getElementById('mahasiswaTableWrapper');
    if (tableWrapper) tableWrapper.innerHTML = renderMahasiswaTable(data);

    // Clear search input
    const searchInput = document.getElementById('searchMahasiswa');
    if (searchInput) searchInput.value = '';

    showToast(`Sync berhasil! ${data.length} data mahasiswa dimuat ulang.`, 'success');
  } catch (err) {
    showToast('Gagal sync data: ' + (err.message || 'Unknown error'), 'error');
  }
}

function showImportMahasiswa() {
  openModal('Import Data Mahasiswa', `
    <div class="upload-area" id="uploadArea">
      <p>📁 Klik atau seret file Excel/CSV ke sini</p>
      <p style="font-size:12px;margin-top:8px">Format header: nomor, nama, nim, wa</p>
      <input type="file" id="importFile" accept=".xlsx,.xls,.csv" style="display:none">
    </div>
    <div id="importResult" style="margin-top:16px"></div>`, '');

  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('importFile');
  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = '#2563eb'; });
  uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = '#e2e8f0'; });
  uploadArea.addEventListener('drop', (e) => { e.preventDefault(); fileInput.files = e.dataTransfer.files; handleImport(); });
  fileInput.addEventListener('change', handleImport);
}

async function handleImport() {
  const file = document.getElementById('importFile').files[0];
  if (!file) return;
  const resultDiv = document.getElementById('importResult');
  resultDiv.innerHTML = '<p>Memproses...</p>';
  const res = await api.uploadFile('/mahasiswa/import', file);
  resultDiv.innerHTML = `<p class="${res.success ? 'badge-success' : 'badge-danger'} badge">${res.message}</p>`;
  if (res.success) {
    setTimeout(() => { closeModal(); loadMahasiswa(document.getElementById('contentArea')); }, 1500);
  }
}

function showFormMahasiswa(data = null) {
  const isEdit = !!data;
  openModal(isEdit ? 'Edit Mahasiswa' : 'Tambah Mahasiswa', `
    <form id="formMahasiswa">
      <div class="form-group"><label>Nama Lengkap</label><input name="nama" value="${data?.nama || ''}" required placeholder="Nama lengkap mahasiswa"></div>
      <div class="form-group"><label>NIM <small style="color:var(--text-muted)">(Format: A18.2026.xxxxx)</small></label><input name="nim" value="${data?.nim || ''}" required pattern="A\\d{2}\\.\\d{4}\\.\\d{5}" placeholder="A18.2026.00230" title="Format NIM: A18.2026.00000"></div>
      <div class="form-group"><label>Nomor WhatsApp</label><input name="wa" value="${data?.wa || ''}" required placeholder="08xxxxxxxxxx"></div>
    </form>`, `
    <button class="btn btn-primary" onclick="saveMahasiswa(${isEdit ? `'${data._id}'` : 'null'})">Simpan</button>
    <button class="btn btn-danger" onclick="closeModal()">Batal</button>`);
}

async function saveMahasiswa(id) {
  const form = document.getElementById('formMahasiswa');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);

  // Validasi NIM
  const nimPattern = /^A\d{2}\.\d{4}\.\d{5}$/i;
  if (!nimPattern.test(data.nim)) {
    showToast('Format NIM tidak valid! Gunakan: A18.2026.00000', 'error');
    return;
  }

  if (id) await api.put(`/mahasiswa/${id}`, data);
  else await api.post('/mahasiswa', data);

  // Re-index otomatis: semua nomor diurutkan berdasarkan NIM
  try {
    const allRes = await api.get('/mahasiswa');
    const allData = (allRes.data || []).sort((a, b) => {
      const sa = parseInt(a.nim.slice(-5), 10) || 0;
      const sb = parseInt(b.nim.slice(-5), 10) || 0;
      return sa - sb;
    });
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].nomor !== i + 1) {
        await api.put(`/mahasiswa/${allData[i]._id}`, { nomor: i + 1 });
      }
    }
  } catch (_) {}

  closeModal(); showToast('Mahasiswa tersimpan & nomor ter-reindex'); loadMahasiswa(document.getElementById('contentArea'));
}

async function editMahasiswa(id) {
  const res = await api.get(`/mahasiswa/${id}`);
  showFormMahasiswa(res.data);
}

async function deleteMahasiswa(id) {
  if (!confirm('Hapus mahasiswa ini?')) return;
  await api.delete(`/mahasiswa/${id}`);
  showToast('Mahasiswa dihapus'); loadMahasiswa(document.getElementById('contentArea'));
}

// ============ RANGKUMAN ============
async function loadRangkuman(area) {
  const [rangRes, matkulRes] = await Promise.all([api.get('/rangkuman'), api.get('/matkul')]);
  const data = rangRes.data || [];
  const matkuls = matkulRes.data || [];
area.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>📋 Rangkuman</h2>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" onclick="manualSyncRangkuman()">🔄 Sync dari Google Sheets</button>
          <button class="btn btn-primary btn-sm" onclick="showFormRangkuman(null, window._matkuls)">+ Tambah</button>
        </div>
      </div>
      <div class="card-body"><div class="table-wrapper">
        ${data.length ? `<table><thead><tr><th>Mata Kuliah</th><th>Judul</th><th>Isi</th><th>Google Doc</th><th>Aksi</th></tr></thead><tbody>
          ${data.map(r => `<tr><td>${r.matkul_id?.nama || '-'}</td><td>${r.judul}</td><td>${(r.isi || '').substring(0, 50)}...</td><td>${r.gdoc_link ? `<a href="${r.gdoc_link}" target="_blank" class="btn btn-info btn-sm">Lihat Doc</a>` : '-'}</td>
          <td><button class="btn btn-success btn-sm" onclick="dispatchRangkuman('${r._id}')">Kirim</button> <button class="btn btn-primary btn-sm" onclick="editRangkuman('${r._id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="deleteRangkuman('${r._id}')">Hapus</button></td></tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>Belum ada rangkuman</p></div>'}
      </div></div>`;

  window._matkuls = matkuls;
}

function showFormRangkuman(data, matkuls) {
  const isEdit = !!data;
  const matkulOpts = (matkuls || window._matkuls || []).map(m => `<option value="${m._id}" ${data?.matkul_id === m._id || data?.matkul_id?._id === m._id ? 'selected' : ''}>${m.nama}</option>`).join('');
  const savedTargets = data?.target_group_ids || [];
  openModal(isEdit ? 'Edit Rangkuman' : 'Tambah Rangkuman', `
    <form id="formRangkuman">
      <div class="form-group"><label>Mata Kuliah</label><select name="matkul_id">${matkulOpts}</select></div>
      <div class="form-group"><label>Judul</label><input name="judul" value="${data?.judul || ''}" required></div>
      <div class="form-group"><label>Isi Rangkuman</label><textarea name="isi" style="min-height:120px">${data?.isi || ''}</textarea></div>
      <div class="form-group"><label>Tugas Tambahan</label><textarea name="tugas_tambahan">${data?.tugas_tambahan || ''}</textarea></div>
      <div class="form-group"><label>Google Doc Link</label><input name="gdoc_link" value="${data?.gdoc_link || ''}" placeholder="https://docs.google.com/document/d/..."></div>
      
      <div class="form-group">
        <label>Target Grup Broadcast</label>
        <select name="target_group_ids" multiple style="min-height:120px;">
          <option value="" disabled>Pilih grup target (Ctrl+Click untuk multi-select)</option>
          ${getTargetGroupOptions().replace(/<option value="([^"]+)">([^<]+)<\/option>/g, (match, value, label) => 
            `<option value="${value}" ${savedTargets.includes(value) ? 'selected' : ''}>${label}</option>`
          )}
        </select>
        <small style="color:var(--text-muted);display:block;margin-top:4px;">Grup yang akan menerima rangkuman. Kelola di menu Pengaturan.</small>
      </div>
    </form>`, `
    <button class="btn btn-primary" onclick="saveRangkuman(${isEdit ? `'${data._id}'` : 'null'})">Simpan & Kirim</button>
    <button class="btn btn-danger" onclick="closeModal()">Batal</button>`);
}

async function saveRangkuman(id) {
  const form = document.getElementById('formRangkuman');
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  data.target_group_ids = fd.getAll('target_group_ids').filter(Boolean);
  let res;
  if (id) res = await api.put(`/rangkuman/${id}`, data);
  else res = await api.post('/rangkuman', data);
  closeModal(); showToast('Rangkuman tersimpan, Google Doc dibuat & otomatis dikirim ke grup WA!'); loadRangkuman(document.getElementById('contentArea'));
}

async function editRangkuman(id) {
  const res = await api.get(`/rangkuman/${id}`);
  showFormRangkuman(res.data);
}

async function deleteRangkuman(id) {
  if (!confirm('Hapus rangkuman ini?')) return;
  await api.delete(`/rangkuman/${id}`);
  showToast('Rangkuman dihapus'); loadRangkuman(document.getElementById('contentArea'));
}

async function dispatchRangkuman(id) {
  if (!confirm('Kirim rangkuman ini ke grup WhatsApp?')) return;
  // Get selected target groups from form if in edit modal
  const form = document.getElementById('formRangkuman');
  let targetGroups = [];
  if (form) {
    const select = form.querySelector('select[name="target_group_ids"]');
    if (select) {
      targetGroups = Array.from(select.selectedOptions).map(opt => opt.value);
    }
  }
  const res = await api.post(`/rangkuman/${id}/dispatch`, { target_group_ids: targetGroups });
  showToast(res.message || 'Selesai', res.success ? 'success' : 'error');
}

async function manualSyncRangkuman() {
  showToast('Sedang sync data rangkuman dari server...', 'info');
  try {
    const res = await api.get('/rangkuman');
    const data = res.data || [];
    const area = document.getElementById('contentArea');
    if (area) loadRangkuman(area);
    showToast(`Sync berhasil! ${data.length} rangkuman dimuat ulang.`, 'success');
  } catch (err) {
    showToast('Gagal sync rangkuman: ' + (err.message || 'Unknown error'), 'error');
  }
}

// ============ TITIP ABSEN ============
async function loadTitipAbsen(area) {
  const res = await api.get('/titip-absen');
  const data = res.data || [];
  area.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>📋 Titip Absen</h2>
        <div class="btn-group">
          <button class="btn btn-outline-primary btn-sm" onclick="manualSyncTitipAbsen()">🔄 Sync dari Google Sheets</button>
          <button class="btn btn-danger btn-sm" onclick="clearAllTitipAbsen()">🗑️ Hapus Semua Data</button>
        </div>
      </div>
      <div class="card-body"><div class="table-wrapper">
        ${data.length ? `<table><thead><tr><th>#</th><th>Timestamp / Waktu</th><th>NIM</th><th>Nama Mahasiswa</th><th>Password</th><th>Matrikulasi / Ikut</th><th>Aksi</th></tr></thead><tbody>
          ${data.map((t, i) => `<tr>
            <td>${i + 1}</td>
            <td>${t.timestamp}</td>
            <td>${t.nim}</td>
            <td>${t.nama || '-'}</td>
            <td>${t.password || '-'}</td>
            <td>${t.matrikulasi || '-'}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteTitipAbsen('${t._id}')">Hapus</button></td>
          </tr>`).join('')}
        </tbody></table>` : '<div class="empty-state"><p>Belum ada data titip absen</p></div>'}
      </div></div>`;
}

async function manualSyncTitipAbsen() {
  showToast('Sedang sync data titip absen dari server...', 'info');
  try {
    const res = await api.get('/titip-absen');
    const data = res.data || [];
    const area = document.getElementById('contentArea');
    if (area) loadTitipAbsen(area);
    showToast(`Sync berhasil! ${data.length} data titip absen dimuat ulang.`, 'success');
  } catch (err) {
    showToast('Gagal sync titip absen: ' + (err.message || 'Unknown error'), 'error');
  }
}

async function deleteTitipAbsen(id) {
  if (!confirm('Hapus data titip absen ini?')) return;
  try {
    await api.delete(`/titip-absen/${id}`);
    showToast('Data berhasil dihapus');
    loadTitipAbsen(document.getElementById('contentArea'));
  } catch (err) {
    showToast('Gagal menghapus: ' + err.message, 'error');
  }
}

async function clearAllTitipAbsen() {
  if (!confirm('Yakin ingin menghapus SEMUA data titip absen? Tindakan ini tidak dapat dibatalkan.')) return;
  try {
    const res = await api.delete('/titip-absen/clear-all');
    showToast(res.message || 'Semua data berhasil dihapus');
    loadTitipAbsen(document.getElementById('contentArea'));
  } catch (err) {
    showToast('Gagal menghapus: ' + err.message, 'error');
  }
}

// ============ SETTINGS ============
async function loadSettings(area) {
  const [settingsRes, statusRes, waGroupsRes] = await Promise.all([
    api.get('/settings'), 
    api.get('/settings/bot-status'),
    api.get('/settings/wa/groups')
  ]);
  const settings = settingsRes.data || {};
  const botStatus = statusRes.data || {};
  const waStatusClass = botStatus.connected ? 'connected' : botStatus.status === 'waiting_scan' ? 'waiting_scan' : 'disconnected';
  
  // Update cached target groups
  window._targetGroups = settings.target_groups || [];

  // Get mahasiswa count for test dispatch info
  const mahasiswaRes = await api.get('/mahasiswa');
  const mahasiswaCount = mahasiswaRes.data?.length || 0;

  // Get scheduler settings
  const reminderOffset = settings.reminder_offset_minutes || 10;
  const googleFormsAbsen = settings.google_forms_absen || '';
  const allowedGroups = (settings.allowed_groups || []).join(', ');
  const reminderH3Time = settings.reminder_h3_time || '08:00';
  const reminderH1Time = settings.reminder_h1_time || '08:00';
  const reminderH0Time = settings.reminder_h0_time || '08:00';
  const linkTitipAbsen = settings.link_titip_absen || 'https://docs.google.com/forms/d/e/1FAIpQLScgeyz6d6CQVjLkgpvklxVS2Bcnxhj-K1kjVD_Rpv8bPPi0bw/viewform?usp=header';
  const pengumumanRecurringTime = settings.pengumuman_recurring_time || '20:00';
  const pengumumanRecurringDays = (settings.pengumuman_recurring_days || []).join(', ');
  const gasSyncUrlArsib = settings.gas_sync_url_arsib || '';

  area.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Status WhatsApp</h3>
        <div class="wa-status" style="margin-top:8px">
          <span class="status-dot ${waStatusClass}"></span>
          <span style="font-size:16px;font-weight:600">${botStatus.status || 'unknown'}</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>Reminder Offset (menit)</h3>
        <div class="stat-value">${reminderOffset}</div>
      </div>
    </div>

    <!-- WhatsApp QR Code Section -->
    <div class="card">
      <div class="card-header"><h2>📱 WhatsApp QR Code</h2></div>
      <div class="card-body">
        <div class="qr-container" id="qrContainerSettings" style="display:none; text-align:center;">
          <img id="qrImageSettings" alt="QR Code" style="width:200px;height:200px;border-radius:8px;border:2px solid var(--border);">
          <p style="margin-top:8px;font-size:12px;color:var(--text-muted)">Scan QR WhatsApp</p>
        </div>
        <div id="waStatusSettings" style="text-align:center;padding:20px;">
          <div class="wa-status" style="justify-content:center;margin-bottom:12px;">
            <span class="status-dot ${waStatusClass}"></span>
            <span style="font-size:16px;font-weight:600">${botStatus.status || 'unknown'}</span>
          </div>
          <p style="color:var(--text-muted);margin-bottom:16px;">Menunggu koneksi WhatsApp...</p>
          <button class="btn btn-warning" onclick="resetWA()">🔄 Generate / Reset QR Code</button>
        </div>
      </div>
    </div>

    <!-- General Settings -->
    <div class="card">
      <div class="card-header"><h2>⚙️ Pengaturan Umum</h2></div>
      <div class="card-body">
        <form id="formSettings">
          <div class="form-group"><label>Reminder Offset Kuliah (menit sebelum jam mulai)</label><input type="number" name="reminder_offset_minutes" value="${reminderOffset}" min="1" max="60"></div>
          <div class="form-group"><label>Link Google Forms Titip Absen (untuk pengumuman berulang)</label><input name="google_forms_absen" value="${googleFormsAbsen}" placeholder="https://forms.google.com/..."></div>
          <div class="form-group"><label>Link Forms Titip Absen (dari Settings Database)</label><input name="link_titip_absen" value="${linkTitipAbsen}" placeholder="https://docs.google.com/forms/d/..."></div>
          <div class="form-group"><label>Group ID Aktif (pisah koma)</label><input name="allowed_groups" value="${allowedGroups}" placeholder="120363...@g.us"></div>
          <div class="form-group"><label>GAS Web App Sync URL Arsip Bot</label><input name="gas_sync_url_arsib" value="${gasSyncUrlArsib}" placeholder="https://script.google.com/macros/s/.../exec"></div>
          <button type="button" class="btn btn-primary" onclick="saveSettings()">Simpan Pengaturan Umum</button>
        </form>
      </div>
    </div>

    <!-- Target Groups Settings -->
    <div class="card">
      <div class="card-header">
        <h2>🎯 Target Grup Broadcast</h2>
        <button class="btn btn-primary btn-sm" onclick="selectAllGroups()">☑️ Pilih Semua</button>
        <button class="btn btn-secondary btn-sm" onclick="deselectAllGroups()">☐ Hapus Semua</button>
      </div>
      <div class="card-body">
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">Pilih grup WhatsApp yang akan menjadi target broadcast (Reminder Kuliah, Titip Absen, Tugas, Pengumuman). Format: [Nama Grup] (JID: 120363...@g.us)</p>
        <div class="form-group">
          <button class="btn btn-info btn-sm" onclick="fetchWAGroups()">🔄 Refresh Daftar Grup dari WhatsApp</button>
        </div>
        <div id="waGroupsContainer" style="margin-top:12px;">
          <div style="text-align:center;padding:20px;color:var(--text-muted);">Klik "Refresh" untuk memuat daftar grup dari WhatsApp</div>
        </div>
        <div class="form-group" style="margin-top:16px;">
          <button class="btn btn-primary" onclick="saveTargetGroups()">💾 Simpan Target Grup</button>
        </div>
      </div>
    </div>

    <!-- Scheduler Settings: Task Reminders -->
    <div class="card">
      <div class="card-header"><h2>⏰ Pengaturan Jam Broadcast Reminder Tugas Otomatis</h2></div>
      <div class="card-body">
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">Atur jam pengiriman reminder tugas otomatis (H-3, H-1, H-0) oleh cron job scheduler.</p>
        <form id="formSchedulerTasks">
          <div class="form-row">
            <div class="form-group"><label>Jam Reminder H-3 (3 hari sebelum deadline)</label><input type="time" name="reminder_h3_time" value="${reminderH3Time}"></div>
            <div class="form-group"><label>Jam Reminder H-1 (1 hari sebelum deadline)</label><input type="time" name="reminder_h1_time" value="${reminderH1Time}"></div>
          </div>
          <div class="form-group"><label>Jam Reminder H-0 (Hari deadline)</label><input type="time" name="reminder_h0_time" value="${reminderH0Time}"></div>
          <button type="button" class="btn btn-primary" onclick="saveSchedulerTasks()">Simpan Jadwal Reminder Tugas</button>
        </form>
      </div>
    </div>

    <!-- Scheduler Settings: Pengumuman Berulang -->
    <div class="card">
      <div class="card-header"><h2>📢 Pengaturan Pengumuman Berulang (Titip Absen)</h2></div>
      <div class="card-body">
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">Atur jam dan hari pengiriman pengumuman berulang otomatis (misal: Google Forms Titip Absen).</p>
        <form id="formSchedulerPengumuman">
          <div class="form-group"><label>Jam Pengiriman Pengumuman Berulang</label><input type="time" name="pengumuman_recurring_time" value="${pengumumanRecurringTime}"></div>
          <div class="form-group"><label>Hari Pengulangan (pisah koma: senin,selasa,rabu...)</label><input name="pengumuman_recurring_days" value="${pengumumanRecurringDays}" placeholder="senin,selasa,rabu,kamis,jumat,sabtu,minggu"></div>
          <button type="button" class="btn btn-primary" onclick="saveSchedulerPengumuman()">Simpan Jadwal Pengumuman</button>
        </form>
      </div>
    </div>

    <!-- Test Dispatch Section -->
    <div class="card">
      <div class="card-header"><h2>🧪 Uji Coba Pengiriman Bot</h2></div>
      <div class="card-body">
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">Uji coba pengiriman pesan ke grup target atau ke seluruh nomor WhatsApp mahasiswa.</p>
        
        <div class="form-group">
          <label>Pesan Uji Coba</label>
          <textarea id="testMessage" style="min-height:80px" placeholder="Ketik pesan uji coba di sini..."></textarea>
        </div>
        
        <div class="form-group">
          <label>Target Pengiriman</label>
          <select id="testTargetType" onchange="toggleTestTarget()">
            <option value="group">📤 Kirim ke Grup Target</option>
            <option value="individual">👥 Kirim ke Semua Mahasiswa (DM)</option>
          </select>
        </div>
        
        <div id="testGroupTarget" style="display:block;">
<div class="form-group">
          <label>Pilih Grup Target</label>
          <select id="testGroupSelect" style="min-height:100px;" multiple>
            <option value="" disabled>Pilih grup (Ctrl+Click untuk multi-select)</option>
            ${getTargetGroupOptions()}
          </select>
          <small style="color:var(--text-muted);display:block;margin-top:4px;">Kelola grup target di section "Target Grup Broadcast" di atas.</small>
        </div>
        </div>
        
        <div id="testIndividualInfo" style="display:none; padding:12px; background:#f0f9ff; border-radius:8px; border:1px solid var(--primary);">
          <strong>ℹ️ Info:</strong> Akan mengirim pesan DM ke seluruh ${mahasiswaCount} mahasiswa terdaftar. Format nomor otomatis dikonversi ke JID internasional (62xxx@s.whatsapp.net). Proses berurutan dengan delay 200ms per pesan.
        </div>
        
        <div class="form-group">
          <button class="btn btn-warning" onclick="runTestDispatch()">🧪 Kirim Pesan Uji Coba</button>
        </div>
        
        <div id="testDispatchResult" style="margin-top:16px; display:none; padding:12px; border-radius:8px;"></div>
      </div>
    </div>

    <!-- Google Sheets Webhook Endpoints -->
    <div class="card">
      <div class="card-header"><h2>🔗 Google Sheets Webhook Endpoints</h2></div>
      <div class="card-body">
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px;">Endpoint webhook untuk sinkronisasi data dari Google Sheets ke database MongoDB. Kirim POST request dengan JSON payload ke URL berikut.</p>

        <div style="margin-bottom:24px;padding:16px;border:1px solid var(--border);border-radius:8px;background:var(--card);">
          <h4 style="margin:0 0 8px 0;">📊 Section 1: Data Mahasiswa PJJ</h4>
          <p style="color:var(--text-muted);font-size:12px;margin:0 0 12px 0;">Data mahasiswa pjj — reset & insert seluruh data</p>
          <div style="display:flex;gap:8px;align-items:center;">
            <input id="webhookMahasiswa" readonly value="${window.location.origin}/bot/api/sync/mahasiswa"
              style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:6px;background:#f8fafc;font-family:monospace;font-size:13px;">
            <button class="btn btn-primary btn-sm" onclick="copyWebhook('webhookMahasiswa')">📋 Copy</button>
          </div>
          <div style="margin-top:8px;">
            <span style="font-size:12px;color:var(--text-muted);">Metode: <code>POST</code> | Body: JSON array <code>[{nomor, nama, nim, wa}, ...]</code></span>
          </div>
        </div>

        <div style="padding:16px;border:1px solid var(--border);border-radius:8px;background:var(--card);">
          <h4 style="margin:0 0 8px 0;">🗄️ Section 2: Arsip Bot</h4>
          <p style="color:var(--text-muted);font-size:12px;margin:0 0 8px 0;">Base URL untuk semua endpoint sync arsip bot</p>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;">
            <input readonly value="${window.location.origin}/bot/api/sync/"
              style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:6px;background:#f8fafc;font-family:monospace;font-size:13px;">
            <button class="btn btn-primary btn-sm" onclick="copyText('${window.location.origin}/bot/api/sync/')">📋 Copy</button>
          </div>

          <h4 style="margin:0 0 8px 0;">List Endpoint Aktif</h4>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${[
              { name: 'Pengumuman', path: 'pengumuman', desc: 'Upsert/update pengumuman', method: 'POST', body: '[{judul, isi, schedule_time, ...}]' },
              { name: 'Tugas', path: 'tugas', desc: 'Cocokkan matkul by nama, upsert/update', method: 'POST', body: '[{matkul, judul, deskripsi, deadline, ...}]' },
              { name: 'Rangkuman', path: 'rangkuman', desc: 'Cocokkan matkul by nama, upsert/update', method: 'POST', body: '[{matkul, judul, isi, tugas_tambahan, ...}]' }
            ].map(ep => `
              <div style="display:flex;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:6px;background:#f8fafc;gap:12px;">
                <span style="padding:2px 8px;border-radius:4px;background:var(--primary);color:#fff;font-size:11px;font-weight:600;">${ep.method}</span>
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:600;font-size:13px;">${ep.name}</div>
                  <div style="font-size:11px;color:var(--text-muted);font-family:monospace;">/bot/api/sync/${ep.path}</div>
                  <div style="font-size:11px;color:var(--text-muted);">${ep.desc}</div>
                </div>
                <span style="padding:2px 8px;border-radius:4px;background:#22c55e;color:#fff;font-size:11px;">Active</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>`;

  // Re-attach socket listeners for settings page QR
  if (typeof socket !== 'undefined' && socket) {
    socket.off('qr');
    socket.off('status');
    socket.on('qr', (qrDataUrl) => {
      const container = document.getElementById('qrContainerSettings');
      const img = document.getElementById('qrImageSettings');
      const statusDiv = document.getElementById('waStatusSettings');
      if (container && img) {
        img.src = (qrDataUrl && qrDataUrl.startsWith('data:')) ? qrDataUrl : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}`;
        container.style.display = 'block';
        if (statusDiv) statusDiv.style.display = 'none';
      }
    });
    socket.on('status', (data) => {
      const container = document.getElementById('qrContainerSettings');
      const statusDiv = document.getElementById('waStatusSettings');
      const dot = statusDiv ? statusDiv.querySelector('.status-dot') : null;
      const text = statusDiv ? statusDiv.querySelector('span:last-child') : null;
      if (dot) {
        dot.className = 'status-dot ' + (data.status === 'connected' ? 'connected' : data.status === 'waiting_scan' ? 'waiting_scan' : 'disconnected');
      }
      if (text) {
        text.textContent = data.status === 'connected' ? 'Connected' : data.status === 'waiting_scan' ? 'Menunggu Scan' : 'Offline';
      }
      if (data.status === 'connected' && container) {
        container.style.display = 'none';
        if (statusDiv) statusDiv.style.display = 'block';
      }
    });
  }
}

async function saveSettings() {
  const form = document.getElementById('formSettings');
  const fd = new FormData(form);
  const fields = ['reminder_offset_minutes', 'google_forms_absen', 'link_titip_absen', 'allowed_groups', 'gas_sync_url_arsib'];
  for (const key of fields) {
    let value = fd.get(key);
    if (key === 'reminder_offset_minutes') value = Number(value);
    if (key === 'allowed_groups') value = value.split(',').map(s => s.trim()).filter(Boolean);
    await api.post('/settings', { key, value });
  }
  showToast('Pengaturan umum tersimpan');
  loadSettings(document.getElementById('contentArea'));
}

async function saveSchedulerTasks() {
  const form = document.getElementById('formSchedulerTasks');
  const fd = new FormData(form);
  const fields = ['reminder_h3_time', 'reminder_h1_time', 'reminder_h0_time'];
  for (const key of fields) {
    const value = fd.get(key);
    await api.post('/settings', { key, value });
  }
  showToast('Jadwal reminder tugas tersimpan');
  loadSettings(document.getElementById('contentArea'));
}

async function saveSchedulerPengumuman() {
  const form = document.getElementById('formSchedulerPengumuman');
  const fd = new FormData(form);
  const fields = ['pengumuman_recurring_time', 'pengumuman_recurring_days'];
  for (const key of fields) {
    let value = fd.get(key);
    if (key === 'pengumuman_recurring_days') value = value.split(',').map(s => s.trim()).filter(Boolean);
    await api.post('/settings', { key, value });
  }
  showToast('Jadwal pengumuman berulang tersimpan');
  loadSettings(document.getElementById('contentArea'));
}

async function resetWA() {
  if (!confirm('Yakin ingin reset QR Code WhatsApp? Sesu ini akan memutus koneksi dan meminta scan ulang.')) return;
  try {
    const res = await api.post('/settings/wa/reset');
    showToast(res.message || 'QR Code direset', res.success ? 'success' : 'error');
    loadSettings(document.getElementById('contentArea'));
  } catch (err) {
    showToast('Gagal reset QR: ' + err.message, 'error');
  }
}

async function fetchWAGroups() {
  const container = document.getElementById('waGroupsContainer');
  container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);">Memuat daftar grup...</div>';
  
  try {
    const res = await api.get('/settings/wa/groups');
    if (!res.success || !res.data || res.data.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);">Gagal memuat grup. Pastikan WhatsApp terhubung.</div>';
      return;
    }
    
    // Get saved target groups
    const settingsRes = await api.get('/settings');
    const savedTargetGroups = settingsRes.data?.target_groups || [];
    
    container.innerHTML = getTargetGroupCheckboxes(savedTargetGroups);
  } catch (err) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--danger);">Error: ${err.message}</div>`;
  }
}

function selectAllGroups() {
  document.querySelectorAll('input[name="target_group"]').forEach(cb => cb.checked = true);
}

function deselectAllGroups() {
  document.querySelectorAll('input[name="target_group"]').forEach(cb => cb.checked = false);
}

async function saveTargetGroups() {
  const checkboxes = document.querySelectorAll('input[name="target_group"]:checked');
  const selectedGroups = Array.from(checkboxes).map(cb => cb.value);
  
  try {
    await api.post('/settings', { key: 'target_groups', value: selectedGroups });
    // Update the targetGroupsMap
    await loadTargetGroups();
    showToast(`Target grup tersimpan (${selectedGroups.length} grup dipilih)`, 'success');
  } catch (err) {
    showToast('Gagal menyimpan: ' + err.message, 'error');
  }
}

function toggleTestTarget() {
  const type = document.getElementById('testTargetType').value;
  document.getElementById('testGroupTarget').style.display = type === 'group' ? 'block' : 'none';
  document.getElementById('testIndividualInfo').style.display = type === 'individual' ? 'block' : 'none';
}

async function runTestDispatch() {
  const message = document.getElementById('testMessage').value.trim();
  const targetType = document.getElementById('testTargetType').value;
  const resultDiv = document.getElementById('testDispatchResult');
  
  if (!message) {
    showToast('Pesan uji coba harus diisi', 'error');
    return;
  }
  
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = '<div style="padding:12px;background:#f0f9ff;border-radius:8px;color:var(--primary);">⏳ Mengirim pesan uji coba...</div>';
  
  try {
    let res;
    if (targetType === 'group') {
      const select = document.getElementById('testGroupSelect');
      const selectedGroups = Array.from(select.selectedOptions).map(opt => opt.value);
      if (selectedGroups.length === 0) {
        showToast('Pilih minimal 1 grup target', 'error');
        return;
      }
      res = await api.post('/settings/wa/test-group', { groupId: selectedGroups[0], message });
    } else {
      res = await api.post('/settings/wa/test-individual', { message });
    }
    
    if (res.success) {
      resultDiv.innerHTML = `<div style="padding:12px;background:#f0fff4;border-radius:8px;color:var(--success);"><strong>✅ Berhasil:</strong> ${res.message}<br><small>${JSON.stringify(res.summary || res.results, null, 2)}</small></div>`;
      showToast(res.message, 'success');
    } else {
      resultDiv.innerHTML = `<div style="padding:12px;background:#fff0f0;border-radius:8px;color:var(--danger);"><strong>❌ Gagal:</strong> ${res.message}<br><small>${JSON.stringify(res.results, null, 2)}</small></div>`;
      showToast(res.message, 'error');
    }
  } catch (err) {
    resultDiv.innerHTML = `<div style="padding:12px;background:#fff0f0;border-radius:8px;color:var(--danger);"><strong>❌ Error:</strong> ${err.message}</div>`;
    showToast('Error: ' + err.message, 'error');
  }
}

// Webhook copy helpers
function copyWebhook(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    navigator.clipboard.writeText(input.value).then(() => {
      showToast('URL webhook disalin ke clipboard!');
    }).catch(() => {
      input.select();
      document.execCommand('copy');
      showToast('URL webhook disalin!');
    });
  }
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('URL disalin ke clipboard!');
  }).catch(() => {
    showToast('Gagal menyalin URL', 'error');
  });
}
