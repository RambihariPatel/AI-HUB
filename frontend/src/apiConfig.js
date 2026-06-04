let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Remove trailing slash if present
if (rawUrl.endsWith('/')) {
  rawUrl = rawUrl.slice(0, -1);
}

// If rawUrl ends with '/api', strip it to prevent double /api routing
export const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl;

export const getLogoUrl = (tool) => {
  if (!tool || !tool.link) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(tool?.name || 'AI')}&background=6366f1&color=fff&bold=true&size=128`;
  }
  try {
    const domain = new URL(tool.link).hostname;
    return `${API_BASE_URL}/api/utils/proxy-logo?domain=${domain}&name=${encodeURIComponent(tool.name)}`;
  } catch {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=6366f1&color=fff&bold=true&size=128`;
  }
};
