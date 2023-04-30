const privateKeys = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toString',
  'valueOf',
  'toLocaleString',
];

const privatePrefixes = ['$$', '__'];

export function getAllPublicObjectKeys(data: any): string[] {
  const arr = new Set<string>();
  while (data) {
    for (const key of Object.keys(data)) {
      arr.add(key);
    }
    for (const key of Object.getOwnPropertyNames(data)) {
      arr.add(key);
    }
    data = data.__proto__;
  }
  return Array.from(arr).filter(key => {
    if (privateKeys.includes(key)) {
      return false;
    }
    if (privatePrefixes.find(prefix => key.startsWith(prefix)) !== undefined) {
      return false;
    }
    return true;
  });
}

export function isPropertyAllowed(value: any, key: string): boolean {
  let allowed: string[];
  // array
  if (Array.isArray(value)) {
    allowed = ['length', 'slice', 'join'];
  }

  // undefined
  else if (typeof value === 'object' && !value) {
    return false;
  }

  // object
  else if (typeof value === 'object') {
    allowed = getAllPublicObjectKeys(value);
  }

  // string
  else if (typeof value === 'string') {
    allowed = ['length', 'replaceAll', 'substring'];
  }

  // other
  else {
    return false;
  }

  return allowed.indexOf(key) !== -1;
}
