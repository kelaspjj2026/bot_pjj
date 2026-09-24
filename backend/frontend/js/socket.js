let socket = null;

function initSocket() {
  if (typeof io === 'undefined') {
    console.warn('Socket.IO client library not loaded, skipping real-time socket connection.');
    return;
  }
  const socketPath = window.location.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '') + '/socket.io';
  socket = io(window.location.origin, { path: socketPath });

  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });

  socket.on('qr', (qrDataUrl) => {
    const container = document.getElementById('qrContainer');
    const img = document.getElementById('qrImage');
    const settingsContainer = document.getElementById('qrContainerSettings');
    const settingsImg = document.getElementById('qrImageSettings');
    const statusDiv = document.getElementById('waStatusSettings');
    
    if (container && img) {
      // Use base64 data URL directly if provided, otherwise fallback to external API
      img.src = (qrDataUrl && qrDataUrl.startsWith('data:')) ? qrDataUrl : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}`;
      container.style.display = 'block';
    }
    // Also update settings page QR if present
    if (settingsContainer && settingsImg) {
      settingsImg.src = (qrDataUrl && qrDataUrl.startsWith('data:')) ? qrDataUrl : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}`;
      settingsContainer.style.display = 'block';
      if (statusDiv) statusDiv.style.display = 'none';
    }
  });

  socket.on('status', (data) => {
    const dot = document.querySelector('.status-dot');
    const text = document.getElementById('waStatusText');
    if (dot) {
      dot.className = 'status-dot ' + (data.status === 'connected' ? 'connected' : data.status === 'waiting_scan' ? 'waiting_scan' : 'disconnected');
    }
    if (text) {
      text.textContent = data.status === 'connected' ? 'Connected' : data.status === 'waiting_scan' ? 'Menunggu Scan' : 'Offline';
    }
    if (data.status === 'connected') {
      const container = document.getElementById('qrContainer');
      if (container) container.style.display = 'none';
    }
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
  });

  // Real-time sync: auto-refresh tables when webhook sync occurs
  socket.on('mahasiswa:updated', (data) => {
    console.log('[Socket] mahasiswa:updated', data);
    if (typeof currentPage !== 'undefined' && currentPage === 'mahasiswa') {
      const area = document.getElementById('contentArea');
      if (area) loadMahasiswa(area);
      showToast('Data mahasiswa diperbarui dari sync', 'success');
    }
  });

  socket.on('pengumuman:updated', (data) => {
    console.log('[Socket] pengumuman:updated', data);
    if (typeof currentPage !== 'undefined' && currentPage === 'pengumuman') {
      const area = document.getElementById('contentArea');
      if (area) loadPengumuman(area);
      showToast('Data pengumuman diperbarui dari sync', 'success');
    }
  });

  socket.on('tugas:updated', (data) => {
    console.log('[Socket] tugas:updated', data);
    if (typeof currentPage !== 'undefined' && currentPage === 'tugas') {
      const area = document.getElementById('contentArea');
      if (area) loadTugas(area);
      showToast('Data tugas diperbarui dari sync', 'success');
    }
  });

  socket.on('rangkuman:updated', (data) => {
    console.log('[Socket] rangkuman:updated', data);
    if (typeof currentPage !== 'undefined' && currentPage === 'rangkuman') {
      const area = document.getElementById('contentArea');
      if (area) loadRangkuman(area);
      showToast('Data rangkuman diperbarui dari sync', 'success');
    }
  });

  socket.on('rangkuman:created', (data) => {
    console.log('[Socket] rangkuman:created', data);
    if (typeof currentPage !== 'undefined' && currentPage === 'rangkuman') {
      const area = document.getElementById('contentArea');
      if (area) loadRangkuman(area);
    }
  });

  socket.on('tugas:created', (data) => {
    console.log('[Socket] tugas:created', data);
    if (typeof currentPage !== 'undefined' && currentPage === 'tugas') {
      const area = document.getElementById('contentArea');
      if (area) loadTugas(area);
    }
  });

  socket.on('titip_absen:updated', (data) => {
    console.log('[Socket] titip_absen:updated', data);
    if (typeof currentPage !== 'undefined' && currentPage === 'titip-absen') {
      const area = document.getElementById('contentArea');
      if (area) loadTitipAbsen(area);
      showToast('Data titip absen diperbarui dari sync', 'success');
    }
  });
}