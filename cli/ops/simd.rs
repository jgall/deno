// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
use super::dispatch_json::{JsonOp, Value};
use crate::op_error::OpError;
use crate::state::State;
use deno_core::CoreIsolate;
use deno_core::ZeroCopyBuf;
use std::arch::x86_64::*;

pub fn init(i: &mut CoreIsolate, s: &State) {
  i.register_op(
    "op_do_simd_mm128_add_epi32",
    s.stateful_json_op(op_simd_mm256_mul_pd),
  );
}

pub fn op_simd_mm256_mul_pd(
  _state: &State,
  _args: Value,
  bufs: &mut [ZeroCopyBuf],
) -> Result<JsonOp, OpError> {
  if let [a, b, res] = bufs {
    unsafe {
      let lhs_bytes: &[u8] = a;
      let rhs_bytes: &[u8] = b;
      let res_bytes: &[u8] = res;
      let len = lhs_bytes.len();
      if len != rhs_bytes.len() || len != res_bytes.len() {
        panic!("buffers must all be the same length")
      }

      let lhs_ptr = lhs_bytes.as_ptr();
      let rhs_ptr = rhs_bytes.as_ptr();
      let res_ptr = res_bytes.as_ptr();
      for i in (0..len).step_by(32) {
        let l = _mm256_loadu_pd(lhs_ptr.offset(i as isize) as *const _);
        let r = _mm256_loadu_pd(rhs_ptr.offset(i as isize) as *const _);
        let res = _mm256_mul_pd(l, r);
        _mm256_store_pd(res_ptr.offset(i as isize) as *mut _, res);
      }
    }
  } else {
    assert_eq!(bufs.len(), 3, "Must supply three buffers");
  }

  Ok(JsonOp::Sync(json!({})))
}
