import 'server-only';

export const INSTAGRAM_OAUTH_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_messages',
  'instagram_business_manage_comments',
] as const;

export interface InstagramOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  graphApiVersion: string;
}

export interface InstagramProfile {
  userId: string;
  username: string | null;
}

export interface InstagramAccessToken {
  accessToken: string;
  expiresIn: number;
  profile: InstagramProfile;
}

type Env = Record<string, string | undefined>;

export function getInstagramOAuthConfig(env: Env = process.env): InstagramOAuthConfig {
  // Instagram Login uses the credentials shown under Instagram > API setup
  // with Instagram Login. Do not silently fall back to the generic Meta App
  // credentials: using the Facebook/WhatsApp app ID here can trigger
  // Instagram's opaque "Invalid platform app" authorization error.
  const appId = env.INSTAGRAM_APP_ID?.trim();
  const appSecret = env.INSTAGRAM_APP_SECRET?.trim();
  const redirectUri = env.INSTAGRAM_REDIRECT_URI?.trim();
  const graphApiVersion = env.INSTAGRAM_GRAPH_API_VERSION?.trim() || 'v25.0';

  if (!appId || !appSecret || !redirectUri) {
    throw new Error('Instagram OAuth is not configured.');
  }

  let redirect: URL;
  try {
    redirect = new URL(redirectUri);
  } catch {
    throw new Error('Instagram redirect URI must be an absolute URL.');
  }

  const localHttp = redirect.protocol === 'http:' &&
    (redirect.hostname === 'localhost' || redirect.hostname === '127.0.0.1');
  if (redirect.protocol !== 'https:' && !localHttp) {
    throw new Error('Instagram redirect URI must use HTTPS.');
  }

  if (!/^v\\d+\\.\\d+$/.test(graphApiVersion)) {
    throw new Error('Instagram Graph API version is invalid.');
  }

  return { appId, appSecret, redirectUri, graphApiVersion };
}

export function buildInstagramAuthorizationUrl(
  config: Pick<InstagramOAuthConfig, 'appId' | 'redirectUri'>,
  state: string,
): string {
  const url = new URL('https://www.instagram.com/oauth/authorize');
  url.searchParams.set('client_id', config.appId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', INSTAGRAM_OAUTH_SCOPES.join(','));
  url.searchParams.set('state', state);
  url.searchParams.set('enable_fb_login', '0');
  url.searchParams.set('force_authentication', '1');
  return url.toString();
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body: unknown = await response.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
}

function providerError(body: Record<string, unknown>, fallback: string): Error {
  const nested = body.error;
  const nestedMessage =
    nested && typeof nested === 'object' && 'message' in nested
      ? (nested as { message?: unknown }).message
      : undefined;
  const message = typeof body.error_message === 'string'
    ? body.error_message
    : typeof nestedMessage === 'string'
      ? nestedMessage
      : fallback;
  // Do not include request URLs, query strings, authorization codes, or tokens.
  return new Error(message.slice(0, 240));
}

export async function exchangeInstagramAuthorizationCode(
  code: string,
  config: InstagramOAuthConfig,
  fetcher: typeof fetch = fetch,
): Promise<InstagramAccessToken> {
  if (!code || code.length > 4096) {
    throw new Error('Instagram returned an invalid authorization code.');
  }

  const form = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
    code,
  });

  const shortResponse = await fetcher('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
    cache: 'no-store',
  });
  const shortBody = await readJson(shortResponse);
  const shortToken = typeof shortBody.access_token === 'string' ? shortBody.access_token : '';
  if (!shortResponse.ok || !shortToken) {
    throw providerError(shortBody, 'Instagram authorization-code exchange failed.');
  }

  const longUrl = new URL('https://graph.instagram.com/access_token');
  longUrl.searchParams.set('grant_type', 'ig_exchange_token');
  longUrl.searchParams.set('client_secret', config.appSecret);
  longUrl.searchParams.set('access_token', shortToken);

  const longResponse = await fetcher(longUrl, { cache: 'no-store' });
  const longBody = await readJson(longResponse);
  const accessToken = typeof longBody.access_token === 'string' ? longBody.access_token : '';
  const expiresIn = typeof longBody.expires_in === 'number' ? longBody.expires_in : 0;
  if (!longResponse.ok || !accessToken || expiresIn <= 0) {
    throw providerError(longBody, 'Instagram long-lived token exchange failed.');
  }

  const profileUrl = new URL(`https://graph.instagram.com/${config.graphApiVersion}/me`);
  profileUrl.searchParams.set('fields', 'user_id,username');
  profileUrl.searchParams.set('access_token', accessToken);
  const profileResponse = await fetcher(profileUrl, { cache: 'no-store' });
  const profileBody = await readJson(profileResponse);
  const userId = typeof profileBody.user_id === 'string'
    ? profileBody.user_id
    : typeof profileBody.id === 'string'
      ? profileBody.id
      : '';
  const username = typeof profileBody.username === 'string' ? profileBody.username : null;

  if (!profileResponse.ok || !/^\\d+$/.test(userId)) {
    throw providerError(profileBody, 'Could not verify the connected Instagram professional account.');
  }

  return {
    accessToken,
    expiresIn,
    profile: { userId, username },
  };
}
