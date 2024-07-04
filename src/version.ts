export const IncrementTypes = ['major', 'minor', 'patch'] as const;

export type IncrementType = typeof IncrementTypes[number];

export type Version = {
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  build?: string;
};

export function splitVersion(version: string): Version {
  const [versionCore, suffix] = version.split(/[-+]/, 2);
  const [preReleasePart, buildPart] = suffix?.split('+', 2);
  const [major, minor, patch] = versionCore.split('.').map(Number);

  return {
    major,
    minor,
    patch,
    preRelease: preReleasePart,
    build: buildPart,
  };
}

export function joinVersion(version: Version): string {
  const { major, minor, patch, preRelease, build } = version;
  let versionString = `${major}.${minor}.${patch}`;

  if (preRelease) {
    versionString += `-${preRelease}`;
  }

  if (build) {
    versionString += `+${build}`;
  }

  return versionString;
}

export function incrementVersion(version: Version, type: IncrementType): Version {
  let { major, minor, patch } = version;

  switch (type) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
    case 'minor':
      minor += 1;
      patch = 0;
    case 'patch':
      patch += 1;
  }

  return {
    ...version,
    major,
    minor,
    patch
  };
}

export function setFirstVersion(type?: IncrementType) {
  const defaultVersion = '0.1.0';
  return type === 'major' ? '1.0.0' : defaultVersion;
}
