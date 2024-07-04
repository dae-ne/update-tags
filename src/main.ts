import simpleGit from 'simple-git';
import { setFailed } from '@actions/core';
import { splitVersion, incrementVersion, buildFullVersion, setFirstVersion, buildMinorVersion, buildMajorVersion } from './version';
import { Inputs, getInputs, setOutputs } from './io';

const git = simpleGit();

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

  const { specificVersion, incrementType } = inputs;
  const { all, latest } = tags;

  if (specificVersion) {
    setOutputs(specificVersion, latest);
    return;
  }

  if (!latest) {
    const firstVersion = setFirstVersion(incrementType);
    setOutputs(firstVersion);
    return;
  }

  const hasPrefix = latest.startsWith('v');
  const latestSemanticVersion = hasPrefix ? latest.slice(1) : latest;

  let version = splitVersion(latestSemanticVersion);
  version = incrementVersion(version, incrementType);

  let versionString = buildFullVersion(version);
  let minorVersionString = buildMinorVersion(version);
  let majorVersionString = buildMajorVersion(version);

  if (hasPrefix) {
    versionString = `v${versionString}`;
    minorVersionString = `v${minorVersionString}`;
    majorVersionString = `v${majorVersionString}`;
  }

  try {
    await git.addAnnotatedTag(minorVersionString, `Release ${minorVersionString}`);
    await git.addAnnotatedTag(majorVersionString, `Release ${majorVersionString}`);
    await git.addAnnotatedTag(versionString, `Release ${versionString}`);
    await git.pushTags(['--force']);
  } catch (error) {
    setFailed(error.message);
    return;
  }

  setOutputs(versionString, latest);
});
