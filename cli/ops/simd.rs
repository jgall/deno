// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
use super::dispatch_json::{JsonOp, Value};
use crate::op_error::OpError;
use crate::state::State;
use deno_core::CoreIsolate;
use deno_core::ZeroCopyBuf;
use rayon::prelude::*;
use std::arch::x86_64::*;

pub fn init(i: &mut CoreIsolate, s: &State) {
  i.register_op(
    "simd_mm256_mul_pd",
    s.stateful_json_op(op_simd_mm256_mul_pd),
  );
  i.register_op(
    "thread_simd_mm256_mul_pd",
    s.stateful_json_op(op_thread_simd_mm256_mul_pd),
  );
}

pub fn op_simd_mm256_mul_pd(
  _state: &State,
  _args: Value,
  bufs: &mut [ZeroCopyBuf],
) -> Result<JsonOp, OpError> {
  // println!("Got message!");
  if let [a, b, res] = bufs {
    unsafe {
      let lhs_bytes: &[u8] = a;
      let rhs_bytes: &[u8] = b;
      let res_bytes: &[u8] = res;
      // println!(
      //   "found res bytes len: {}, content: {:?}",
      //   res_bytes.len(),
      //   res_bytes
      // );
      let len = lhs_bytes.len();
      if len != rhs_bytes.len() || len != res_bytes.len() {
        panic!("buffers must all be the same length")
      }

      let lhs_ptr = lhs_bytes.as_ptr();
      let rhs_ptr = rhs_bytes.as_ptr();
      let res_ptr = res_bytes.as_ptr();
      for i in (0..len).step_by(32) {
        // println!("Executing SIMD set! on {}", i);
        // println!("{}", *(lhs_ptr as *const f64));
        // println!("{}", *(rhs_ptr as *const f64));
        let l = _mm256_loadu_pd(lhs_ptr.offset(i as isize) as *const _);
        let r = _mm256_loadu_pd(rhs_ptr.offset(i as isize) as *const f64);
        let res = _mm256_mul_pd(l, r);
        _mm256_storeu_pd(res_ptr.offset(i as isize) as *mut f64, res);
        // let first = *(res_ptr as *mut f64);
        // println!("first: {}", first);
      }
    }
  } else {
    assert_eq!(bufs.len(), 3, "Must supply three buffers");
  }

  Ok(JsonOp::Sync(json!({"status": "good"})))
}

pub fn op_thread_simd_mm256_mul_pd(
  _state: &State,
  _args: Value,
  bufs: &mut [ZeroCopyBuf],
) -> Result<JsonOp, OpError> {
  // println!("Got message!");
  if let [a, b, res] = bufs {
    unsafe {
      let a: &[u8] = a;
      let b: &[u8] = b;
      let res: &mut [u8] = res;
      let len = a.len();
      if len != b.len() || len != res.len() {
        panic!("buffers must all be the same length")
      }
      a.par_chunks_exact(32)
        .zip(b.par_chunks_exact(32).zip(res.par_chunks_exact_mut(32)))
        .for_each(|(a, (b, c))| {
          let a = a.as_ptr();
          let b = b.as_ptr();
          let c = c.as_ptr();
          let l = _mm256_loadu_pd(a as *const _);
          let r = _mm256_loadu_pd(b as *const f64);
          let res = _mm256_mul_pd(l, r);
          _mm256_storeu_pd(c as *mut f64, res);
        });
      // println!(
      //   "found res bytes len: {}, content: {:?}",
      //   res_bytes.len(),
      //   res_bytes
      // );
    }
  } else {
    assert_eq!(bufs.len(), 3, "Must supply three buffers");
  }

  Ok(JsonOp::Sync(json!({"status": "good"})))
}
