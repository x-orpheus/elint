'use strict';

const packageNameRegexp = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(?:@.+)?$/;

/**
 * 解析 npm package name
 */
function parse(packageName) {
  if (!packageName || !packageNameRegexp.test(packageName)) {
    return null;
  }

  const slices = packageName.split('@');

  if (slices.length === 1) {
    return {
      name: packageName
    };
  } else if (slices.length === 2 && !slices[0]) {
    const arr = packageName.split('/');

    return {
      scope: arr[0],
      name: arr[1]
    };
  } else if (slices.length === 2 && slices[0]) {
    return {
      name: slices[0],
      version: slices[1]
    };
  }

  const arr1 = packageName.split('/');
  const arr2 = arr1[1].split('@');

  return {
    scope: arr1[0],
    name: arr2[0],
    version: arr2[1]
  };
}

module.exports = parse;
