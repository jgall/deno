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
    "simd_mm256_mul_ps",
    s.stateful_json_op(op_simd_mm256_mul_ps),
  );
  i.register_op(
    "thread_simd_mm256_mul_pd",
    s.stateful_json_op(op_thread_simd_mm256_mul_pd),
  );
  i.register_op(
    "thread_simd_mm256_mul_ps",
    s.stateful_json_op(op_thread_simd_mm256_mul_ps),
  );
}
macro_rules! simd_macro {
  ( $name:ident, $stride:ty, $load:ident, $store:ident, $f:ident ) => {
    fn $name(_state: &State, _args: Value, bufs: &mut [ZeroCopyBuf]) -> Result<JsonOp, OpError> {
      if let [a, b, res] = bufs {
        unsafe {
          let (_, lhs_bytes, _) = a.align_to::<$stride>();
          let (_, rhs_bytes, _) = b.align_to::<$stride>();
          let (_, res_bytes, _) = res.align_to::<$stride>();
          let len = lhs_bytes.len();
          if len != rhs_bytes.len() || len != res_bytes.len() {
            return Err(OpError::type_error(
              "buffers must all be the same length".to_owned(),
            ));
          }
          let lhs_ptr = lhs_bytes.as_ptr();
          let rhs_ptr = rhs_bytes.as_ptr();
          let res_ptr = res_bytes.as_ptr();
          for i in 0..len {
            let l = $load(lhs_ptr.offset(i as isize) as *const _);
            let r = $load(rhs_ptr.offset(i as isize) as *const _);
            let res = $f(l, r);
            $store(res_ptr.offset(i as isize) as *mut _, res);
          }
        }
      } else {
        return Err(OpError::type_error(
          "Must be supplied three buffers".to_owned(),
        ));
      }
      Ok(JsonOp::Sync(json!({"status": "good"})))
    }
  };
}
simd_macro!(
  op_simd_mm256_mul_pd,
  [f64; 4],
  _mm256_load_pd,
  _mm256_store_pd,
  _mm256_mul_pd
);
simd_macro!(
  op_simd_mm256_mul_ps,
  [f32; 8],
  _mm256_load_ps,
  _mm256_store_ps,
  _mm256_mul_ps
);

macro_rules! simd_thread_macro {
  ( $name:ident, $stride:ty, $load:ident, $store:ident, $f:ident ) => {
    fn $name(_state: &State, _args: Value, bufs: &mut [ZeroCopyBuf]) -> Result<JsonOp, OpError> {
      if let [a, b, res] = bufs {
        unsafe {
          let (_, lhs_bytes, _) = a.align_to::<$stride>();
          let (_, rhs_bytes, _) = b.align_to::<$stride>();
          let (_, res_bytes, _) = res.align_to::<$stride>();
          let len = lhs_bytes.len();
          if len != rhs_bytes.len() || len != res_bytes.len() {
            return Err(OpError::type_error(
              "buffers must all be the same length".to_owned(),
            ));
          }
          lhs_bytes
            .par_iter()
            .zip(rhs_bytes.par_iter().zip(res_bytes.par_iter()))
            .for_each(|(a, (b, c))| {
              let a = a.as_ptr();
              let b = b.as_ptr();
              let c = c.as_ptr();
              let l = $load(a as *const _);
              let r = $load(b as *const _);
              let res = $f(l, r);
              $store(c as *mut _, res);
            });
        }
      } else {
        return Err(OpError::type_error(
          "Must be supplied three buffers".to_owned(),
        ));
      }
      Ok(JsonOp::Sync(json!({"status": "good"})))
    }
  }
}
simd_thread_macro!(
  op_thread_simd_mm256_mul_pd,
  [f64; 4],
  _mm256_load_pd,
  _mm256_store_pd,
  _mm256_mul_pd
);
simd_thread_macro!(
  op_thread_simd_mm256_mul_ps,
  [f32; 8],
  _mm256_load_ps,
  _mm256_store_ps,
  _mm256_mul_ps
);
