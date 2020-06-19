import { sendSync } from "./dispatch_json.ts";

export const _sendSync = sendSync;
function mm256_mul_pd(a: Float64Array, b: Float32Array, res: Float64Array) {
  return sendSync(
    "simd_mm256_mul_pd",
    {},
    new Uint8Array(a.buffer),
    new Uint8Array(b.buffer),
    new Uint8Array(res.buffer)
  );
}
export const SIMD = {
  mm256_mul_pd,
};
export const SIMD_THREAD = {
  mm256_mul_pd: (a: Float64Array, b: Float32Array, res: Float64Array) => {
    return sendSync(
      "thread_simd_mm256_mul_pd",
      {},
      new Uint8Array(a.buffer),
      new Uint8Array(b.buffer),
      new Uint8Array(res.buffer)
    );
  },
};
