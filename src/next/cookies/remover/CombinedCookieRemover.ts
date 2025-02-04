import type {CookieSerializeOptions} from 'cookie';
import {CookieRemover} from './CookieRemover.js';
import {MultipleCookieRemover} from './MultipleCookieRemover.js';
import {SingleCookieRemover} from './SingleCookieRemover.js';

export class CombinedCookieRemover implements CookieRemover {
  constructor(
    private multiRemover: MultipleCookieRemover,
    private singleRemover: SingleCookieRemover
  ) {}

  removeCookies(options: CookieSerializeOptions): void {
    this.singleRemover.removeCookies(options);
    this.multiRemover.removeCookies(options);
  }
}
