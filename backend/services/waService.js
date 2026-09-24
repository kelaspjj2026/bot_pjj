const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { SESSIONS_DIR } = require('../config/constants');

let sock = null;
let qrCode = null;
let qrCodeDataUrl = null;
let connectionStatus = 'disconnected';
let ioRef = null;
let groupCache = [];
let reconnecting = false;

const AUTH_DIR = path.join(SESSIONS_DIR, 'auth_info');

// DILARANG KERAS menghapus AUTH_DIR kecuali via resetWA() yang dipanggil eksplisit dari dashboard
const DANGER_DELETE_SESSION = false; // Guard flag — JANGAN PERNAH ubah ke true tanpa user action

const initWA = async (io) => {
  ioRef = io;
  console.log('[WA] Initializing with persistent session at:', AUTH_DIR);
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }),
    browser: ['WA Bot PJJ', 'Safari', '3.0'],
    shouldSyncHistoryMessage: () => false,
    markOnlineOnConnect: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 15000,
    generateHighQualityLinkPreview: false,
    options: {},
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 5,
  });

  sock.ev.on('creds.update', async () => {
    try {
      await saveCreds();
    } catch (err) {
      console.error('[WA] Error saving credentials:', err.message);
    }
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCode = qr;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(qr);
      } catch (err) {
        console.error('[WA] QR Code generation error:', err.message);
        qrCodeDataUrl = null;
      }
      connectionStatus = 'waiting_scan';
      if (ioRef) ioRef.emit('qr', qrCodeDataUrl);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      
      if (!isLoggedOut) {
        // DILARANG menghapus folder sesi di sini — hanya reconnect
        connectionStatus = 'reconnecting';
        console.log('[WA] Connection closed, auto-reconnect in 5s (session preserved)...', lastDisconnect?.error?.message);
        if (ioRef) ioRef.emit('status', { status: 'reconnecting' });
        if (!reconnecting) {
          reconnecting = true;
          setTimeout(async () => {
            try {
              await initWA(io);
            } catch (err) {
              console.error('[WA] Reconnect failed:', err.message);
            } finally {
              reconnecting = false;
            }
          }, 5000);
        }
      } else {
        // Logged out — sesi sudah invalid, TIDAK perlu hapus folder (biarkan Baileys handle)
        connectionStatus = 'disconnected';
        qrCode = null;
        qrCodeDataUrl = null;
        groupCache = [];
        reconnecting = false;
        console.log('[WA] Logged out, waiting for new QR scan');
        if (ioRef) ioRef.emit('status', { status: 'disconnected' });
      }
    }

    if (connection === 'open') {
      connectionStatus = 'connected';
      qrCode = null;
      qrCodeDataUrl = null;
      reconnecting = false;
      console.log('[WA] Connected successfully');
      await refreshGroupCache();
      if (ioRef) ioRef.emit('status', { status: 'connected' });
    }
  });

  sock.ev.on('messages.upsert', ({ messages }) => {
    const { handleMessage } = require('../handlers/messageHandler');
    messages.forEach(msg => {
      if (!msg.key.fromMe) handleMessage(sock, msg);
    });
  });

  sock.ev.on('groups.upsert', async () => {
    await refreshGroupCache();
  });

  sock.ev.on('group-participants.update', async () => {
    await refreshGroupCache();
  });
};

const refreshGroupCache = async () => {
  if (!sock || connectionStatus !== 'connected') return;
  try {
    const chats = await sock.groupFetchAllParticipating();
    groupCache = [];
    for (const [jid, chat] of Object.entries(chats)) {
      if (chat.id && chat.subject) {
        groupCache.push({
          id: jid,
          name: chat.subject,
          participants: chat.participants?.length || 0,
          isGroup: true
        });
      }
    }
    console.log('[WA] Group cache refreshed:', groupCache.length, 'groups');
  } catch (err) {
    console.error('[WA] Error refreshing group cache:', err.message);
  }
};

const resetWA = async (io) => {
  // HANYA dipanggil dari endpoint POST /api/settings/wa/reset (tombol Reset QR di dashboard)
  // JANGAN PERNAH dipanggil otomatis saat disconnect/restart
  console.log('[WA] Reset requested via dashboard — clearing session files');

  if (sock) {
    try {
      await sock.logout();
    } catch (err) {
      console.error('[WA] Logout error:', err.message);
    }
    sock = null;
  }
  
  // HAPUS folder sesi HANYA SAAT INI dipanggil secara eksplisit dari dashboard
  if (DANGER_DELETE_SESSION) {
    try {
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        console.log('[WA] Session files cleared by explicit user action');
      }
    } catch (err) {
      console.error('[WA] Error clearing session files:', err.message);
    }
  }
  
  qrCode = null;
  qrCodeDataUrl = null;
  connectionStatus = 'disconnected';
  groupCache = [];
  reconnecting = false;
  if (ioRef) ioRef.emit('status', { status: 'disconnected' });
  setTimeout(() => initWA(io), 1000);
};

const normalizeJID = (input) => {
  if (!input) return null;
  const str = String(input).trim();
  if (str.endsWith('@g.us')) return str;
  if (str.includes('@')) return str;
  if (/^\d+$/.test(str)) return `${str}@g.us`;
  return null;
};

const resolveGroupJID = async (input) => {
  if (!input) return null;
  const normalized = normalizeJID(input);
  if (normalized) return normalized;
  
  await refreshGroupCache();
  
  const searchTerm = String(input).trim().toLowerCase();
  const match = groupCache.find(g => 
    g.name.toLowerCase() === searchTerm ||
    g.name.toLowerCase().includes(searchTerm) ||
    g.id.toLowerCase().includes(searchTerm)
  );
  
  if (match) {
    console.log(`[WA] Resolved "${input}" to JID: ${match.id} (${match.name})`);
    return match.id;
  }
  
  return null;
};

const sendMessageWithRetry = async (jid, message, maxRetries = 3) => {
  if (!sock || connectionStatus !== 'connected') {
    throw new Error('WhatsApp not connected');
  }
  
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sock.sendMessage(jid, { text: message });
      return { success: true };
    } catch (err) {
      lastError = err;
      console.warn(`[WA] Send attempt ${attempt}/${maxRetries} failed for ${jid}:`, err.message);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }
  throw lastError;
};

const sendMessageToGroups = async (groupIds, message, options = {}) => {
  if (!sock || connectionStatus !== 'connected') {
    return { success: false, message: 'WhatsApp belum terhubung', results: [] };
  }

  const { logType = 'manual', pengumumanId = null } = options;
  const results = [];

  // Normalize groupIds to array
  let normalizedGroupIds = groupIds;
  if (!Array.isArray(groupIds)) {
    if (typeof groupIds === 'string') {
      normalizedGroupIds = [groupIds];
    } else {
      normalizedGroupIds = [];
    }
  }

  // Fallback to settings.target_groups if groupIds is empty
  if (normalizedGroupIds.length === 0) {
    try {
      const { Settings } = require('../models');
      const settings = await Settings.findOne({ key: 'target_groups' });
      if (settings && settings.value && Array.isArray(settings.value) && settings.value.length > 0) {
        normalizedGroupIds = settings.value;
        console.log('[WA] Using fallback target_groups from settings:', normalizedGroupIds);
      }
    } catch (err) {
      console.error('[WA] Failed to get fallback target_groups:', err.message);
    }
  }

  if (normalizedGroupIds.length === 0) {
    return { success: false, message: 'Tidak ada grup target yang dikonfigurasi', results: [] };
  }

  for (const input of normalizedGroupIds) {
    try {
      const jid = await resolveGroupJID(input);
      if (!jid) {
        console.error(`[WA] Could not resolve group: ${input}`);
        results.push({ input, groupId: input, jid: null, status: 'failed', error: 'Group not found' });
        
        if (pengumumanId && logType !== 'manual') {
          try {
            const { PengumumanLog } = require('../models');
            await PengumumanLog.create({
              pengumuman_id: pengumumanId,
              grup_id: input,
              status: 'failed',
              error: 'Group not found'
            });
          } catch (logErr) {
            console.error('[WA] Failed to log:', logErr.message);
          }
        }
        continue;
      }

      const result = await sendMessageWithRetry(jid, message);
      
      results.push({ input, groupId: jid, jid, status: 'sent' });
      
      if (pengumumanId && logType !== 'manual') {
        try {
          const { PengumumanLog } = require('../models');
          await PengumumanLog.create({
            pengumuman_id: pengumumanId,
            grup_id: jid,
            status: 'sent'
          });
        } catch (logErr) {
          console.error('[WA] Failed to log:', logErr.message);
        }
      }
      
    } catch (err) {
      console.error(`[WA] Failed to send to ${input}:`, err.message);
      results.push({ input, groupId: input, jid: null, status: 'failed', error: err.message });
      
      if (pengumumanId && logType !== 'manual') {
        try {
          const { PengumumanLog } = require('../models');
          await PengumumanLog.create({
            pengumuman_id: pengumumanId,
            grup_id: input,
            status: 'failed',
            error: err.message
          });
        } catch (logErr) {
          console.error('[WA] Failed to log:', logErr.message);
        }
      }
    }
  }

  return {
    success: results.some(r => r.status === 'sent'),
    results,
  };
};

const getWAStatus = () => ({
  status: connectionStatus,
  qr: qrCodeDataUrl,
  qrRaw: qrCode,
  connected: connectionStatus === 'connected',
});

const getSock = () => sock;

const getGroups = async () => {
  if (!sock || connectionStatus !== 'connected') {
    return { success: false, message: 'WhatsApp belum terhubung', groups: [] };
  }
  
  try {
    await refreshGroupCache();
    return { success: true, groups: groupCache };
  } catch (err) {
    console.error('[WA] Error fetching groups:', err.message);
    return { success: false, message: err.message, groups: [] };
  }
};

const formatPhoneToJID = (phone) => {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('62')) {
    // already has country code
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return `${cleaned}@s.whatsapp.net`;
};

const testGroupDispatch = async (groupInput, message) => {
  if (!sock || connectionStatus !== 'connected') {
    return { success: false, message: 'WhatsApp belum terhubung', results: [] };
  }
  
  try {
    const jid = await resolveGroupJID(groupInput);
    if (!jid) {
      return { success: false, message: 'Grup tidak ditemukan', results: [{ input: groupInput, status: 'failed', error: 'Group not found' }] };
    }
    
    const result = await sendMessageWithRetry(jid, message);
    return { success: true, message: 'Pesan test grup terkirim', results: [{ input: groupInput, jid, status: 'sent' }] };
  } catch (err) {
    console.error('[WA] Test group dispatch error:', err.message);
    return { success: false, message: err.message, results: [{ input: groupInput, status: 'failed', error: err.message }] };
  }
};

const testIndividualDispatch = async (message) => {
  if (!sock || connectionStatus !== 'connected') {
    return { success: false, message: 'WhatsApp belum terhubung', results: [] };
  }
  
  try {
    const { Mahasiswa } = require('../models');
    const students = await Mahasiswa.find({}, { wa: 1, nama: 1, nim: 1 });
    
    if (!students || students.length === 0) {
      return { success: false, message: 'Tidak ada data mahasiswa', results: [] };
    }
    
    const results = [];
    let sent = 0;
    let failed = 0;
    
    for (const student of students) {
      try {
        const jid = formatPhoneToJID(student.wa);
        if (!jid) {
          results.push({ nama: student.nama, nim: student.nim, wa: student.wa, status: 'failed', error: 'Invalid phone number' });
          failed++;
          continue;
        }
        
        await sendMessageWithRetry(jid, message);
        results.push({ nama: student.nama, nim: student.nim, wa: student.wa, jid, status: 'sent' });
        sent++;
        
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        results.push({ nama: student.nama, nim: student.nim, wa: student.wa, status: 'failed', error: err.message });
        failed++;
      }
    }
    
    return { 
      success: sent > 0, 
      message: `Test individual dispatch selesai: ${sent} terkirim, ${failed} gagal dari ${students.length} mahasiswa`,
      results,
      summary: { total: students.length, sent, failed }
    };
  } catch (err) {
    console.error('[WA] Test individual dispatch error:', err.message);
    return { success: false, message: err.message, results: [] };
  }
};

const closeWA = async () => {
  // Graceful shutdown: tutup WebSocket Baileys bersih TANPA menghapus folder sesi
  console.log('[WA] Graceful shutdown — closing connection...');
  if (sock) {
    try {
      sock.end(undefined);
      console.log('[WA] Connection closed gracefully');
    } catch (err) {
      console.error('[WA] Error closing connection:', err.message);
    }
    sock = null;
  }
  connectionStatus = 'disconnected';
};

module.exports = { initWA, closeWA, resetWA, sendMessageToGroups, getWAStatus, getSock, getGroups, resolveGroupJID, testGroupDispatch, testIndividualDispatch, formatPhoneToJID };