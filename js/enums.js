/**
 * Extra effects enum
 */
const effect = {
  bold: 0,
  dim: 1,
  underline: 2,
  blink: 3,
  reverse: 4,
  hidden: 5
};

/**
 * Color enum
 */
const color = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7
};

/**
 * Color types enum
 */
const colorType = {
  fg: 1,
  bg: 2,
  fb: 3
};

/**
 * Value type enum
 */
const valueType = {
  Object: 0,
  String: 1
};

/**
 * Method type enum
 */

const Method = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE"
};

module.exports = {
  effect,
  color,
  colorType,
  valueType,
  Method
};
