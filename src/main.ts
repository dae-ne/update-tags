import { setFailed } from '@actions/core';
import simpleGit, { SimpleGit } from 'simple-git';

import { getInputs, Inputs, setOutputs } from './io';
import {
  buildFullVersion,
  buildMajorVersion,
  buildMinorVersion,
  getInitialVersion,
  incrementVersion,
  splitVersion,
  Version
} from './version';

async function handleAction(): Promise<void> {
  const git = configureGit();
  await git.pull(['--tags', '--quiet']);

  const { latest } = await git.tags();

  const inputs = getInputs();
  const version = getNewVersion(inputs, latest);

  const versionString = buildFullVersion(version);
  const minorVersionString = buildMinorVersion(version);
  const majorVersionString = buildMajorVersion(version);

  const getTagArguments = (tag: string): string[] => [
    '-f',
    '-a',
    `-m "Updating ${tag} to ${versionString}"`,
    tag
  ];

  await git
    .tag(getTagArguments(majorVersionString))
    .tag(getTagArguments(minorVersionString))
    .addAnnotatedTag(versionString, `Release ${versionString}`)
    .pushTags(['--force']);

  setOutputs(versionString, latest);
}

function configureGit(): SimpleGit {
  const { GITHUB_ACTOR, GITHUB_ACTOR_ID } = process.env;

  return simpleGit({
    config: [
      `user.email=${GITHUB_ACTOR_ID}+${GITHUB_ACTOR}@users.noreply.github.com`,
      `user.name=${GITHUB_ACTOR}`
    ]
  });
}

function getNewVersion(inputs: Inputs, tag?: string): Version {
  const { specificVersion, incrementType } = inputs;

  if (specificVersion) {
    return splitVersion(specificVersion);
  }

  if (!tag) {
    return getInitialVersion(incrementType);
  }

  const version = splitVersion(tag);
  return incrementVersion(version, incrementType);
}

(async (): Promise<void> => {
  try {
    await handleAction();
  } catch (error) {
    setFailed(error.message);
  }
})();
