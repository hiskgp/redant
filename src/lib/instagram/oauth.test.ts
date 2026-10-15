import { describe, expect, it } from 'vitest';
import {
  buildInstagramAuthorizationUrl,
  getInstagramOAuthConfig,
  INSTAGRAM_OAUTH_SCOPES,
} from './oauth';

describe('Instagram OAuth helpers', () => {
  it('requires explicit app credentials and redirect URI', () => {
    expect(() => getInstagramOAuthConfig({})).toThrow(/not configured/i);
  });

  it('rejects non-HTTPS redirect URIs outside localhost', () => {
    expect(() => getInstagramOAuthConfig({
      INSTAGRAM_APP_ID: 'app-id',
      INSTAGRAM_APP_SECRET: 'app-secret',
      INSTAGRAM_REDIRECT_URI: 'http://redant.in/api/instagram/callback',
    })).toThrow(/HTTPS/i);
  });

  it('allows localhost HTTP for local development', () => {
    const config = getInstagramOAuthConfig({
      INSTAGRAM_APP_ID: 'app-id',
      INSTAGRAM_APP_SECRET: 'app-secret',
      INSTAGRAM_REDIRECT_URI: 'http://localhost:3000/api/instagram/callback',
    });
    expect(config.redirectUri).toBe('http://localhost:3000/api/instagram/callback');
  });

  it('builds the Instagram Login URL with current scope names and state', () => {
    const url = new URL(buildInstagramAuthorizationUrl({
      appId: 'test-app',
      redirectUri: 'https://redant.in/api/instagram/callback',
    }, 'csrf-state'));

    expect(url.origin + url.pathname).toBe('https://www.instagram.com/oauth/authorize');
    expect(url.searchParams.get('client_id')).toBe('test-app');
    expect(url.searchParams.get('redirect_uri')).toBe('https://redant.in/api/instagram/callback');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('state')).toBe('csrf-state');
    expect(url.searchParams.get('scope')?.split(',')).toEqual([...INSTAGRAM_OAUTH_SCOPES]);
    expect(url.searchParams.get('enable_fb_login')).toBe('0');
  });
});
