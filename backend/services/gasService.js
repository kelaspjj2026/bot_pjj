const axios = require('axios');

const GAS_FALLBACK_URL = 'https://script.google.com/macros/s/AKfycbxsX-umBdeX2zEhioLAFR1yg8Vnsyo4XUj6JfLRyAMxof4nkVyYJcg-k9DqYVFLs2jg/exec';

const callGASWebhook = async (data) => {
  const { Settings } = require('../models');

  // Prioritas 1: Environment variable
  let gasUrl = process.env.GAS_WEBHOOK_URL;

  // Prioritas 2: Database settings
  if (!gasUrl) {
    try {
      const setting = await Settings.findOne({ key: 'gas_webhook_url' });
      if (setting && setting.value) gasUrl = setting.value;
    } catch (_) {}
  }

  // Prioritas 3: Fallback hardcoded URL
  if (!gasUrl) {
    gasUrl = GAS_FALLBACK_URL;
    console.log('[GAS] Using fallback hardcoded URL');
  }

  const response = await axios.post(gasUrl, data, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 20000,
    maxRedirects: 5
  });

  // Handle GAS redirect response (302 with location)
  if (response.data && typeof response.data === 'string' && response.data.includes('docs.google.com')) {
    const linkMatch = response.data.match(/https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/);
    if (linkMatch) {
      return { success: true, gdoc_link: linkMatch[0] };
    }
  }

  if (response.data && response.data.status === 'success' && response.data.gdoc_link) {
    return { success: true, gdoc_link: response.data.gdoc_link };
  }

  // Try to extract gdoc_link from any response format
  if (response.data && response.data.gdoc_link) {
    return { success: true, gdoc_link: response.data.gdoc_link };
  }

  throw new Error('GAS webhook tidak mengembalikan gdoc_link valid: ' + JSON.stringify(response.data).substring(0, 200));
};

const deleteGASDocument = async (gdoc_link) => {
  if (!gdoc_link) return;

  const { Settings } = require('../models');

  let gasUrl = process.env.GAS_WEBHOOK_URL;
  if (!gasUrl) {
    try {
      const setting = await Settings.findOne({ key: 'gas_webhook_url' });
      if (setting && setting.value) gasUrl = setting.value;
    } catch (_) {}
  }
  if (!gasUrl) gasUrl = GAS_FALLBACK_URL;

  try {
    await axios.post(gasUrl, { action: 'delete', gdoc_link }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000,
      maxRedirects: 5
    });
    console.log('[GAS] Document deleted:', gdoc_link);
  } catch (err) {
    console.error('[GAS] Delete document error:', err.message);
  }
};

module.exports = { callGASWebhook, deleteGASDocument };
