import { getInput, setOutput } from '@actions/core';

import { IncrementType, IncrementTypes } from './version';

export type Inputs = {
  specificVersion?: string;
  incrementType: IncrementType;
  skipPush: boolean;
};

export function getInputs(): Inputs {
  const specificVersion = getInput('version');
  const incrementType = getInput('type');
  const skipPush = getInput('skip-push') === 'true';

  if (incrementType && !IncrementTypes.includes(incrementType as IncrementType)) {
    throw new Error(`Invalid increment type: ${incrementType}`);
  }

  return { specificVersion, incrementType: incrementType as IncrementType, skipPush };
}

export function setOutputs(version: string, previousVersion?: string): void {
  setOutput('version', version);
  setOutput('previous-version', previousVersion);
}
