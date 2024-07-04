import simpleGit from 'simple-git';
import { setFailed } from '@actions/core';
import { splitVersion, incrementVersion, buildFullVersion, setFirstVersion as getInitialVersion, buildMinorVersion, buildMajorVersion, Version } from './version';
import { Inputs, getInputs, setOutputs } from './io';

const git = simpleGit();

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

git.tags(async (err, tags) => {
  if (err) {
    setFailed(err.message);
    return;
  }

  let inputs: Inputs;

  try {
    inputs = getInputs();
  } catch (error) {
    setFailed(error.message);
    return;
  }

  const { all, latest } = tags;
  const version = await getNewVersion(inputs, latest);

  if (typeof version === 'string') {
    setFailed(version);
    return;
  }

  let versionString = buildFullVersion(version);
  let minorVersionString = buildMinorVersion(version);
  let majorVersionString = buildMajorVersion(version);

  try {
    await git
      .addAnnotatedTag(majorVersionString, `Updating ${majorVersionString} to ${versionString}`)
      .addAnnotatedTag(minorVersionString, `Updating ${minorVersionString} to ${versionString}`)
      .addAnnotatedTag(versionString, `Release ${versionString}`)
      .pushTags(['--force']);
  } catch (error) {
    setFailed(error.message);
    return;
  }

  setOutputs(versionString, latest);
});
