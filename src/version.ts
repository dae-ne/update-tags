const VERSION_PREFIX = 'v';
const DEFAULT_VERSION = '0.1.0';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IncrementTypes = ['major', 'minor', 'patch'] as const;

export type IncrementType = (typeof IncrementTypes)[number];

export type Version = {
  hasPrefix: boolean;
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  build?: string;
};

export function splitVersion(version: string): Version {
  /* eslint-disable @typescript-eslint/no-unnecessary-condition */

  const hasPrefix = version.startsWith(VERSION_PREFIX);
  const semanticVersion = hasPrefix ? version.slice(1) : version;

  const [versionCore, suffix] = semanticVersion.split(/[-+]/, 2);
  const [major, minor, patch] = versionCore.split('.').map(Number);
  const suffixParts = suffix?.split('+', 2);

  return {
    hasPrefix,
    major,
    minor,
    patch,
    preRelease: suffixParts?.[0],
    build: suffixParts?.[1]
  };

  /* eslint-enable @typescript-eslint/no-unnecessary-condition */
}

export function buildFullVersion(version: Version): string {
  const { hasPrefix, major, minor, patch } = version;
  const versionString = hasPrefix
    ? `${VERSION_PREFIX}${major}.${minor}.${patch}`
    : `${major}.${minor}.${patch}`;
  return addSuffix(versionString, version);
}

export function buildMinorVersion(version: Version): string {
  const { hasPrefix, major, minor } = version;
  const versionString = hasPrefix ? `${VERSION_PREFIX}${major}.${minor}` : `${major}.${minor}`;
  return addSuffix(versionString, version);
}

export function buildMajorVersion(version: Version): string {
  const { hasPrefix, major } = version;
  const versionString = hasPrefix ? `${VERSION_PREFIX}${major}` : `${major}`;
  return addSuffix(versionString, version);
}

export function incrementVersion(version: Version, type: IncrementType): Version {
  let { major, minor, patch } = version;

  switch (type) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      break;
    case 'patch':
      patch += 1;
      break;
    default:
      throw new Error(`Invalid increment type: ${type}`);
  }

  return {
    ...version,
    major,
    minor,
    patch
  };
}

export function getInitialVersion(type?: IncrementType): Version {
  const version = type === 'major' ? '1.0.0' : DEFAULT_VERSION;
  return splitVersion(version);
}

function addSuffix(versionCore: string, version: Version): string {
  const { preRelease, build } = version;
  let versionString = versionCore;

  if (version.preRelease) {
    versionString += `-${preRelease}`;
  }

  if (version.build) {
    versionString += `+${build}`;
  }

  return versionString;
}
