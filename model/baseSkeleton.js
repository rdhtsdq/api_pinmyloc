/**
 * copy dan paste inside your method or function
 */

let result = { error: false, data: null };

try {
  const data = await db2.query(
    `
    `
  );
  result.data = data[0];
  return result;
} catch (error) {
  result.error = true;
  result.data = error;
  return result;
}
