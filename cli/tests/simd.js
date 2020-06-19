let N = 1024 * 1024;

// let a = new Float64Array([...Array(N)].map((_, i) => i));
// let b = new Float64Array([...Array(N)].map((_, i) => i));
// // console.log(a);

// let c = new Uint8Array(new Float64Array(N).buffer);
let a = new Float64Array([...Array(N)].map((_, i) => i % 1024));
let b = new Float64Array([...Array(N)].map((_, i) => i % 1024));
let c = new Float64Array(N);

console.time("rust");
// let res = Deno._sendSync(
//   "simd_mm256_mul_pd",
//   {},
//   new Uint8Array(a.buffer),
//   new Uint8Array(b.buffer),
//   c
// );
float_mul(a, b, c);
console.timeEnd("rust");
let cf = new Float64Array(N);
// let cf = new Float64Array(c.buffer);
console.time("js");
for (let i = 0; i < N; i++) {
  cf[i] = a[i] * b[i];
}
console.timeEnd("js");

// console.log(res);

// console.log(cf[2]);

/**
 *
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @param {Float64Array} c
 */
function float_mul(a, b, c) {
  Deno.SIMD_THREAD.mm256_mul_pd(a, b, c);
}
