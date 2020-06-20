let N = 1024 * 1024 * 16;

// let a = new Float64Array([...Array(N)].map((_, i) => i));
// let b = new Float64Array([...Array(N)].map((_, i) => i));
// // console.log(a);

// let c = new Uint8Array(new Float64Array(N).buffer);
let a = new Float32Array([...Array(N)].map((_, i) => i % 1024));
let b = new Float32Array([...Array(N)].map((_, i) => i % 1024));
let c1 = new Float32Array(N);
for (let i = 0; i < 30; i++) {
  console.time("simd");
  // let res = Deno._sendSync(
  //   "simd_mm256_mul_pd",
  //   {},
  //   new Uint8Array(a.buffer),
  //   new Uint8Array(b.buffer),
  //   c
  // );
  float_mul(a, b, c1);
  console.timeEnd("simd");
}
console.log(c1[0], c1[1], c1[2], c1[3], c1[4], c1[5], c1[6]);

let c2 = new Float32Array(N);
for (let i = 0; i < 30; i++) {
  console.time("simd_thread");
  float_mul_thread(a, b, c2);
  console.timeEnd("simd_thread");
}
let c3 = new Float32Array(N);
for (let i = 0; i < 30; i++) {
  // let cf = new Float64Array(c.buffer);
  console.time("js");
  js_float_mul(a, b, c3);
  console.timeEnd("js");
}
// console.log(res);

// console.log(cf[2]);
/**
 *
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @param {Float64Array} c
 */
function js_float_mul(a, b, c) {
  for (let i = 0; i < N; i++) {
    c[i] = a[i] * b[i];
  }
}
/**
 *
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @param {Float64Array} c
 */
function float_mul_thread(a, b, c) {
  Deno.SIMD_THREAD.mm256_mul_ps(a, b, c);
}
/**
 *
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @param {Float64Array} c
 */
function float_mul(a, b, c) {
  Deno.SIMD.mm256_mul_ps(a, b, c);
}
