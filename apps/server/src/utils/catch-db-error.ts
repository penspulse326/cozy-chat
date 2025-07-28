// import z from 'zod';

// export function catchDbError(error: unknown) {
//   const errorMessage =
//     error instanceof z.ZodError
//       ? `資料驗證失敗: ${error.issues.map((i) => i.message).join(', ')}`
//       : `資料庫錯誤: ${error instanceof Error ? error.message : String(error)}`;
//   console.error(errorMessage);
// }
