import simpleGit, { SimpleGit } from 'simple-git';
import { setFailed } from '@actions/core';
import {
  splitVersion,
  incrementVersion,
  buildFullVersion,
  getInitialVersion,
  buildMinorVersion,
  buildMajorVersion,
  Version
} from './version';
import { Inputs, getInputs, setOutputs } from './io';

function configureGit(): SimpleGit{
  const { GITHUB_ACTOR, GITHUB_ACTOR_ID } = process.env;

  return simpleGit({ config: [
    `user.email=${GITHUB_ACTOR_ID}+${GITHUB_ACTOR}@users.noreply.github.com`,
    `user.name=${GITHUB_ACTOR}`
  ] });
}

async function getNewVersion(inputs: Inputs, tag?: string): Promise<Version> {
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

(async () => {
  try {
    const git = configureGit();
    await git.pull(['--tags', '--quiet']);

    const { latest } = await git.tags();

    const inputs = getInputs();
    const version = await getNewVersion(inputs, latest);

    const versionString = buildFullVersion(version);
    const minorVersionString = buildMinorVersion(version);
    const majorVersionString = buildMajorVersion(version);

    await git
      .tags([
        '-f',
        '-a',
        `-m "Updating ${majorVersionString} to ${versionString}"`,
        majorVersionString
      ])
      .tags([
        '-f',
        '-a',
        `-m "Updating ${minorVersionString} to ${versionString}"`,
        minorVersionString
      ])
      .addAnnotatedTag(versionString, `Release ${versionString}`)
      .pushTags(['--force']);

    setOutputs(versionString, latest);
  } catch (error) {
    setFailed(error.message);
  }
})();
