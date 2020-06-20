import { sendSync } from "./dispatch_json.ts";

export const _sendSync = sendSync;
function mm256_mul_pd(a: Float64Array, b: Float64Array, res: Float64Array) {
  return sendSync(
    "simd_mm256_mul_pd",
    {},
    new Uint8Array(a.buffer),
    new Uint8Array(b.buffer),
    new Uint8Array(res.buffer)
  );
}
function mm256_mul_ps(a: Float32Array, b: Float32Array, res: Float32Array) {
  return sendSync(
    "simd_mm256_mul_ps",
    {},
    new Uint8Array(a.buffer),
    new Uint8Array(b.buffer),
    new Uint8Array(res.buffer)
  );
}
export const SIMD = {
  mm256_mul_pd,
  mm256_mul_ps,
};
export const SIMD_THREAD = {
  mm256_mul_pd: (a: Float64Array, b: Float64Array, res: Float64Array) => {
    return sendSync(
      "thread_simd_mm256_mul_pd",
      {},
      new Uint8Array(a.buffer),
      new Uint8Array(b.buffer),
      new Uint8Array(res.buffer)
    );
  },
  mm256_mul_ps: (a: Float32Array, b: Float32Array, res: Float32Array) => {
    return sendSync(
      "thread_simd_mm256_mul_ps",
      {},
      new Uint8Array(a.buffer),
      new Uint8Array(b.buffer),
      new Uint8Array(res.buffer)
    );
  },
};
