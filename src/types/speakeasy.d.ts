// src/types/speakeasy.d.ts

declare module 'speakeasy' {
  export interface Secret {
    ascii: string
    hex: string
    base32: string
    otpauth_url?: string
  }

  export interface TOTPVerifyOptions {
    secret: string
    encoding: 'ascii' | 'hex' | 'base32'
    token: string
    window?: number
  }

  export function generateSecret(options?: { name: string; issuer?: string }): Secret

  export namespace totp {
    export function generate(options: { secret: string; encoding: 'ascii' | 'hex' | 'base32' }): string

    export function verify(options: TOTPVerifyOptions): boolean
  }
}

// // src/types/speakeasy.d.ts

// declare module 'speakeasy' {
//   export interface Secret {
//     ascii: string
//     hex: string
//     base32: string
//     otpauth_url?: string
//   }

//   export interface TOTPVerifyOptions {
//     secret: string
//     encoding: 'ascii' | 'hex' | 'base32'
//     token: string
//     window?: number
//   }

//   export function generateSecret(options?: { name: string }): Secret

//   export namespace totp {
//     export function generate(options: { secret: string; encoding: 'ascii' | 'hex' | 'base32' }): string

//     export function verify(options: TOTPVerifyOptions): boolean
//   }
// }
