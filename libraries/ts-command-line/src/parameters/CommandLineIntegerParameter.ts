// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import type { ICommandLineIntegerDefinition } from './CommandLineDefinition';
import { CommandLineParameterWithArgument, CommandLineParameterKind } from './BaseClasses';

/**
 * The data type returned by {@link CommandLineParameterProvider.(defineIntegerParameter:2)}.
 * @public
 */
export interface IRequiredCommandLineIntegerParameter extends CommandLineIntegerParameter {
  value: number;
}

/**
 * The data type returned by {@link CommandLineParameterProvider.(defineIntegerParameter:1)}.
 * @public
 */
export class CommandLineIntegerParameter extends CommandLineParameterWithArgument {
  /** {@inheritDoc ICommandLineStringDefinition.defaultValue} */
  public readonly defaultValue: number | undefined;

  private _value: number | undefined = undefined;

  /** @internal */
  public constructor(definition: ICommandLineIntegerDefinition) {
    super(definition);
    this.defaultValue = definition.defaultValue;
    this.validateDefaultValue(!!this.defaultValue);
  }

  /** {@inheritDoc CommandLineParameter.kind} */
  public get kind(): CommandLineParameterKind {
    return CommandLineParameterKind.Integer;
  }

  /**
   * {@inheritDoc CommandLineParameter._setValue}
   * @internal
   */
  public _setValue(data: unknown): void {
    // abstract
    if (data !== null && data !== undefined) {
      if (typeof data !== 'number') {
        this.reportInvalidData(data);
      }
      this._value = data;
      return;
    }

    const envVarValue: number | undefined = this._getValueFromEnvVar();
    if (envVarValue !== undefined) {
      this._value = envVarValue;
      return;
    }

    if (this.defaultValue !== undefined) {
      this._value = this.defaultValue;
      return;
    }

    this._value = undefined;
  }

  /**
   * {@inheritDoc CommandLineParameter._getValueFromEnvVar}
   * @internal
   */
  public _getValueFromEnvVar(): number | undefined {
    if (this.environmentVariable !== undefined) {
      // Try reading the environment variable
      const environmentValue: string | undefined = process.env[this.environmentVariable];
      if (environmentValue !== undefined && environmentValue !== '') {
        const parsed: number = parseInt(environmentValue, 10);
        if (isNaN(parsed) || environmentValue.indexOf('.') >= 0) {
          throw new Error(
            `Invalid value "${environmentValue}" for the environment variable` +
              ` ${this.environmentVariable}.  It must be an integer value.`
          );
        }
        return parsed;
      }
    }
  }

  /**
   * {@inheritDoc CommandLineParameter._getSupplementaryNotes}
   * @internal
   */
  public _getSupplementaryNotes(supplementaryNotes: string[]): void {
    // virtual
    super._getSupplementaryNotes(supplementaryNotes);
    if (this.defaultValue !== undefined) {
      supplementaryNotes.push(`The default value is ${this.defaultValue}.`);
    }
  }

  /**
   * Returns the argument value for an integer parameter that was parsed from the command line.
   *
   * @remarks
   * The return value will be undefined if the command-line has not been parsed yet,
   * or if the parameter was omitted and has no default value.
   */
  public get value(): number | undefined {
    return this._value;
  }

  /** {@inheritDoc CommandLineParameter.appendToArgList} @override */
  public appendToArgList(argList: string[]): void {
    if (this.value !== undefined) {
      argList.push(this.longName);
      argList.push(this.value.toString());
    }
  }
}
