import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import { exchangeInstagramAuthorizationCode, type InstagramOAuthConfig } from './oauth';
import {
  buildInstagramAuthorizationUrl,
  getInstagramOAuthConfig,
  INSTAGRAM_OAUTH_SCOPES,
} from './oauth';

describe('Instagram OAuth helpers', () => {
  it('requires explicit app credentials and redirect URI', () => {
    expect(() => getInstagramOAuthConfig({})).toThrow(/not configured/i);
  });

  it('does not fall back to generic Meta app credentials for Instagram Login', () => {
    expect(() => getInstagramOAuthConfig({
      META_APP_ID: 'facebook-or-whatsapp-app-id',
      META_APP_SECRET: 'generic-meta-app-secret',
      INSTAGRAM_REDIRECT_URI: 'https://staging.redant.in/api/instagram/callback',
    })).toThrow(/not configured/i);
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


const testConfig: InstagramOAuthConfig = {
  appId: 'test-app',
  appSecret: 'test-secret',
  redirectUri: 'https://redant.in/api/instagram/callback',
  graphApiVersion: 'v25.0',
};

describe('Instagram OAuth token exchange', () => {
  it('exchanges the code, upgrades the token, and verifies the professional profile', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: 'short-lived-token',
        user_id: 12345,
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: 'long-lived-token',
        token_type: 'bearer',
        expires_in: 5184000,
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        user_id: '12345',
        username: 'sample_boutique',
      }), { status: 200 }));

    const result = await exchangeInstagramAuthorizationCode('valid-code', testConfig, fetcher);

    expect(result).toEqual({
      accessToken: 'long-lived-token',
      expiresIn: 5184000,
      profile: { userId: '12345', username: 'sample_boutique' },
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls[0][0]).toBe('https://api.instagram.com/oauth/access_token');
    expect(String(fetcher.mock.calls[1][0])).toContain('grant_type=ig_exchange_token');
    expect(String(fetcher.mock.calls[2][0])).toContain('/v25.0/me?fields=user_id%2Cusername');
  });

  it('rejects an invalid authorization code before making a network request', async () => {
    const fetcher = vi.fn();
    await expect(exchangeInstagramAuthorizationCode('', testConfig, fetcher))
      .rejects.toThrow(/invalid authorization code/i);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fails closed when Meta does not return a long-lived token', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: 'short-lived-token',
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        error_message: 'Token exchange rejected',
      }), { status: 400 }));

    await expect(exchangeInstagramAuthorizationCode('valid-code', testConfig, fetcher))
      .rejects.toThrow(/Token exchange rejected/i);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
