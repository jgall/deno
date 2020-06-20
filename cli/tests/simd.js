let N = 1024 * 1024 * 32;

/**
 *
 * @param {number} n
 */
function bench(n) {
  // 32 bit test
  let a32 = new Float32Array([...Array(n)].map((_, i) => i % 1024));
  let b32 = new Float32Array([...Array(n)].map((_, i) => i % 1024));
  let c32 = new Float32Array(n);

  // make sure the memory is fresh
  js_float_mul(a32, b32, c32);

  let mul_32_times = [];
  for (let i = 0; i < 30; i++) {
    let start = performance.now();
    // let res = Deno._sendSync(
    //   "simd_mm256_mul_pd",
    //   {},
    //   new Uint8Array(a.buffer),
    //   new Uint8Array(b.buffer),
    //   c
    // );
    mul_32(a32, b32, c32);
    let end = performance.now();
    mul_32_times.push(end - start);
  }

  let mul_thread_32_times = [];
  for (let i = 0; i < 30; i++) {
    let start = performance.now();
    // let res = Deno._sendSync(
    //   "simd_mm256_mul_pd",
    //   {},
    //   new Uint8Array(a.buffer),
    //   new Uint8Array(b.buffer),
    //   c
    // );
    mul_thread_32(a32, b32, c32);
    let end = performance.now();
    mul_thread_32_times.push(end - start);
  }
  let mul_js_32_times = [];
  for (let i = 0; i < 30; i++) {
    let start = performance.now();
    // let res = Deno._sendSync(
    //   "simd_mm256_mul_pd",
    //   {},
    //   new Uint8Array(a.buffer),
    //   new Uint8Array(b.buffer),
    //   c
    // );
    js_float_mul(a32, b32, c32);
    let end = performance.now();
    mul_js_32_times.push(end - start);
  }

  // 64 bit test
  let a64 = new Float64Array([...Array(n)].map((_, i) => i % 1024));
  let b64 = new Float64Array([...Array(n)].map((_, i) => i % 1024));
  let c64 = new Float64Array(n);
  js_float_mul(a64, b64, c64);

  let mul_64_times = [];
  for (let i = 0; i < 30; i++) {
    let start = performance.now();
    // let res = Deno._sendSync(
    //   "simd_mm256_mul_pd",
    //   {},
    //   new Uint8Array(a.buffer),
    //   new Uint8Array(b.buffer),
    //   c
    // );
    mul_64(a64, b64, c64);
    let end = performance.now();
    mul_64_times.push(end - start);
  }
  let mul_thread_64_times = [];
  for (let i = 0; i < 30; i++) {
    let start = performance.now();
    // let res = Deno._sendSync(
    //   "simd_mm256_mul_pd",
    //   {},
    //   new Uint8Array(a.buffer),
    //   new Uint8Array(b.buffer),
    //   c
    // );
    mul_thread_64(a64, b64, c64);
    let end = performance.now();
    mul_thread_64_times.push(end - start);
  }
  let mul_js_64_times = [];
  for (let i = 0; i < 30; i++) {
    let start = performance.now();
    // let res = Deno._sendSync(
    //   "simd_mm256_mul_pd",
    //   {},
    //   new Uint8Array(a.buffer),
    //   new Uint8Array(b.buffer),
    //   c
    // );
    js_float_mul(a64, b64, c64);
    let end = performance.now();
    mul_js_64_times.push(end - start);
  }
  return [
    mul_32_times,
    mul_thread_32_times,
    mul_js_32_times,
    mul_64_times,
    mul_thread_64_times,
    mul_js_64_times,
  ];
}

/**
 *
 * @param {Float64Array | Float32Array} a
 * @param {Float64Array | Float32Array} b
 * @param {Float64Array | Float32Array} c
 */
function js_float_mul(a, b, c) {
  for (let i = 0; i < N; i++) {
    c[i] = a[i] * b[i];
  }
}
/**
 *
 * @param {Float32Array} a
 * @param {Float32Array} b
 * @param {Float32Array} c
 */
function mul_thread_32(a, b, c) {
  Deno.SIMD_THREAD.mm256_mul_ps(a, b, c);
}
/**
 *
 * @param {Float32Array} a
 * @param {Float32Array} b
 * @param {Float32Array} c
 */
function mul_32(a, b, c) {
  Deno.SIMD.mm256_mul_ps(a, b, c);
}
/**
 *
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @param {Float64Array} c
 */
function mul_thread_64(a, b, c) {
  Deno.SIMD_THREAD.mm256_mul_pd(a, b, c);
}
/**
 *
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @param {Float64Array} c
 */
function mul_64(a, b, c) {
  Deno.SIMD.mm256_mul_pd(a, b, c);
}

console.log(bench(N));

/**
 * example output:
 * [
  [
    66, 46, 40, 38, 40, 40, 40, 38, 40,
    40, 40, 40, 38, 38, 38, 38, 42, 40,
    40, 40, 38, 40, 40, 40, 40, 38, 42,
    40, 40, 40
  ],
  [
    26, 28, 28, 28, 30, 32, 28, 28, 30,
    30, 26, 32, 30, 28, 30, 28, 32, 26,
    32, 26, 30, 30, 28, 30, 30, 28, 36,
    28, 28, 28
  ],
  [
    84, 114, 104, 98, 94, 92, 92, 94, 92,
    94, 92, 92, 96, 92, 94, 92, 94, 92,
    94, 94, 92, 94, 94, 92, 92, 94, 94,
    96, 94,  96
  ],
  [
    90, 78, 78, 80, 82, 82, 86, 88, 82,
    82, 84, 78, 84, 82, 82, 82, 84, 84,
    82, 84, 82, 84, 84, 86, 88, 90, 86,
    84, 86, 88
  ],
  [
    54, 58, 64, 60, 62, 58, 54, 56, 58,
    54, 58, 60, 56, 56, 56, 56, 54, 58,
    56, 58, 58, 70, 58, 56, 56, 58, 56,
    56, 56, 56
  ],
  [
    114, 114, 114, 112, 112, 110,
    114, 116, 110, 106, 110, 110,
    108, 104, 108, 108, 108, 108,
    108, 116, 112, 110, 108, 110,
    108, 108, 108, 110, 112, 108
  ]
]
 */
