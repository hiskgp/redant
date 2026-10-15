import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

import { requireRole, toErrorResponse } from '@/lib/auth/account';
import {
  buildInstagramAuthorizationUrl,
  getInstagramOAuthConfig,
} from '@/lib/instagram/oauth';

const OAUTH_STATE_COOKIE = 'redant_instagram_oauth_state';

export async function GET() {
  try {
    const { accountId } = await requireRole('admin');
    const config = getInstagramOAuthConfig();
    const state = randomUUID();
    const response = NextResponse.redirect(
      buildInstagramAuthorizationUrl(config, state),
    );

    response.cookies.set(OAUTH_STATE_COOKIE, `${state}.${accountId}`, {
      httpOnly: true,
      secure: config.redirectUri.startsWith('https://'),
      sameSite: 'lax',
      path: '/api/instagram/callback',
      maxAge: 10 * 60,
    });

    return response;
  } catch (error) {
    // Auth failures keep the established API error contract. Configuration
    // errors do not expose secrets or raw provider data to the browser.
    if (error instanceof Error && error.message === 'Instagram OAuth is not configured.') {
      return NextResponse.json(
        { error: 'Instagram connection is not configured yet. Complete the Meta App setup first.' },
        { status: 503 },
      );
    }
    return toErrorResponse(error);
  }
}
