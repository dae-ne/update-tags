import simpleGit from 'simple-git';
import { setFailed } from '@actions/core';
import { splitVersion, incrementVersion, joinVersion, setFirstVersion } from './version';
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

  const { specificVersion, incrementType, pushToRemote } = inputs;
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

  let versionString = joinVersion(version);

  if (hasPrefix) {
    versionString = `v${versionString}`;
  }

  if (pushToRemote) {
    try {
      await git.addAnnotatedTag(versionString, `Release ${versionString}`);
      await git.pushTags();
    } catch (error) {
      setFailed(error.message);
      return;
    }
  }

  setOutputs(versionString, latest);
});
