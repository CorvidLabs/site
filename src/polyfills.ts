/**
 * Polyfills for browser compatibility with Node.js modules
 * Required for @perawallet/connect and algosdk
 */

import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer available globally
(window as any).Buffer = Buffer;
(window as any).global = window;
(window as any).process = process;
