import type {IncomingHttpHeaders} from 'http';
import {NextApiRequest, NextApiResponse} from 'next';
import {getFirebaseAuth} from '../auth/index.js';
import {signCookies} from '../auth/cookies/sign.js';
import {CustomTokens, VerifiedTokens} from '../auth/custom-token/index.js';
import {serializeCookies, SetAuthCookiesOptions} from './cookies/index.js';
import {getCookiesTokens} from './tokens.js';

export async function refreshApiResponseCookies(
  request: NextApiRequest,
  response: NextApiResponse,
  options: SetAuthCookiesOptions
): Promise<NextApiResponse> {
  const customTokens = await refreshApiCookies(
    request.cookies,
    request.headers,
    options
  );
  await appendAuthCookiesApi(response, customTokens, options);

  return response;
}

export async function appendAuthCookiesApi(
  response: NextApiResponse,
  tokens: CustomTokens,
  options: SetAuthCookiesOptions
) {
  const cookies = await signCookies(tokens, options.cookieSignatureKeys);

  serializeCookies(cookies, options, (value) => {
    response.setHeader('Set-Cookie', [value]);
  });
}

export async function refreshApiCookies(
  cookies: Partial<{
    [key: string]: string;
  }>,
  headers: IncomingHttpHeaders,
  options: SetAuthCookiesOptions
): Promise<VerifiedTokens> {
  const referer = headers['referer'] ?? '';
  const tokens = await getCookiesTokens(cookies, options);
  const {handleTokenRefresh} = getFirebaseAuth({
    serviceAccount: options.serviceAccount,
    apiKey: options.apiKey,
    tenantId: options.tenantId
  });

  const tokenRefreshResult = await handleTokenRefresh(tokens.refreshToken, {
    referer
  });

  return {
    customToken: tokenRefreshResult.customToken,
    idToken: tokenRefreshResult.idToken,
    refreshToken: tokenRefreshResult.refreshToken,
    decodedIdToken: tokenRefreshResult.decodedIdToken
  };
}
