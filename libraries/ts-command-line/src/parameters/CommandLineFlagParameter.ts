// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import type { ICommandLineFlagDefinition } from './CommandLineDefinition';
import { CommandLineParameter, CommandLineParameterKind } from './BaseClasses';

/**
 * The data type returned by {@link CommandLineParameterProvider.defineFlagParameter}.
 * @public
 */
export class CommandLineFlagParameter extends CommandLineParameter {
  private _value: boolean = false;

  /** @internal */
  public constructor(definition: ICommandLineFlagDefinition) {
    super(definition);
  }

  /** {@inheritDoc CommandLineParameter.kind} */
  public get kind(): CommandLineParameterKind {
    return CommandLineParameterKind.Flag;
  }

  /**
   * {@inheritDoc CommandLineParameter._setValue}
   * @internal
   */
  public _setValue(data: unknown): void {
    // abstract
    if (data !== null && data !== undefined) {
      if (typeof data !== 'boolean') {
        this.reportInvalidData(data);
      }

      // If the flag is omitted, then argparse sets the data to "false" instead of "undefined".
      // This design prevents a syntax such as "--flag=false", probably because argparse prefers "--no-flag".
      // If we switch to a new CLI parser, we should try to add support for "--flag=false".
      if (data) {
        this._value = data;
        return;
      }
    }

    const envVarValue: boolean | undefined = this._getValueFromEnvVar();
    if (envVarValue !== undefined) {
      this._value = envVarValue;
      return;
    }

    this._value = false;
  }

  /**
   * {@inheritDoc CommandLineParameter._getValueFromEnvVar}
   * @internal
   */
  public _getValueFromEnvVar(): boolean | undefined {
    if (this.environmentVariable !== undefined) {
      // Try reading the environment variable
      const environmentValue: string | undefined = process.env[this.environmentVariable];
      if (environmentValue !== undefined && environmentValue !== '') {
        if (environmentValue !== '0' && environmentValue !== '1') {
          throw new Error(
            `Invalid value "${environmentValue}" for the environment variable` +
              ` ${this.environmentVariable}.  Valid choices are 0 or 1.`
          );
        }
        return environmentValue === '1';
      }
    }
  }

  /**
   * Returns a boolean indicating whether the parameter was included in the command line.
   *
   * @remarks
   * The return value will be false if the command-line has not been parsed yet,
   * or if the flag was not used.
   */
  public get value(): boolean {
    return this._value;
  }

  /** {@inheritDoc CommandLineParameter.appendToArgList} @override */
  public appendToArgList(argList: string[]): void {
    if (this.value) {
      argList.push(this.longName);
    }
  }
}
