/**
 * SSRF Protection and URL Sanitation
 * Validates external URLs, blocking private, internal, link-local, and cloud-metadata addresses.
 */

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254', // AWS/GCP/Azure Link-Local Metadata
  'instance-data',
]);

const BLOCKED_SUFFIXES = [
  '.local',
  '.internal',
  '.lan',
  '.corp',
  '.home',
  '.test',
];

export function validateSafeUrl(rawUrl: string): { valid: boolean; normalizedUrl?: string; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  let urlStr = rawUrl.trim();
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    urlStr = 'https://' + urlStr;
  }

  try {
    const parsed = new URL(urlStr);

    // Only HTTP and HTTPS permitted
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: `Invalid protocol: ${parsed.protocol}. Only http and https are allowed.` };
    }

    const host = parsed.hostname.toLowerCase();

    // Check exact blocked hosts
    if (BLOCKED_HOSTNAMES.has(host)) {
      return { valid: false, error: `Access to private/local host ${host} is prohibited (SSRF defense).` };
    }

    // Check blocked domain suffixes
    for (const suffix of BLOCKED_SUFFIXES) {
      if (host.endsWith(suffix)) {
        return { valid: false, error: `Access to internal domain ${host} is prohibited (SSRF defense).` };
      }
    }

    // Check IPv4 private and link-local ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = host.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);

      // 127.0.0.0/8 (Loopback)
      if (octet1 === 127) {
        return { valid: false, error: 'Loopback IP addresses are prohibited.' };
      }
      // 10.0.0.0/8 (Private)
      if (octet1 === 10) {
        return { valid: false, error: 'Private RFC1918 (10.0.0.0/8) IP addresses are prohibited.' };
      }
      // 172.16.0.0/12 (Private)
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
        return { valid: false, error: 'Private RFC1918 (172.16.0.0/12) IP addresses are prohibited.' };
      }
      // 192.168.0.0/16 (Private)
      if (octet1 === 192 && octet2 === 168) {
        return { valid: false, error: 'Private RFC1918 (192.168.0.0/16) IP addresses are prohibited.' };
      }
      // 169.254.0.0/16 (Link Local / Cloud Metadata)
      if (octet1 === 169 && octet2 === 254) {
        return { valid: false, error: 'Link-local and metadata addresses (169.254.0.0/16) are prohibited.' };
      }
      // 0.0.0.0/8
      if (octet1 === 0) {
        return { valid: false, error: 'Broadcast/invalid IP addresses are prohibited.' };
      }
    }

    return { valid: true, normalizedUrl: parsed.toString() };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid URL';
    return { valid: false, error: message };
  }
}
