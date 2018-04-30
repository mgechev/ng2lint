import { sprintf } from 'sprintf-js';
import { IOptions, IRuleMetadata, RuleFailure, Rules } from 'tslint/lib';
import { arrayify } from 'tslint/lib/utils';
import { Decorator, Node, PropertyAccessExpression, PropertyDeclaration, SourceFile } from 'typescript';

import { NgWalker } from './angular/ngWalker';

export class Rule extends Rules.AbstractRule {
  static readonly metadata: IRuleMetadata = {
    description: 'Input names should not be prefixed by the configured disallowed prefixes.',
    optionExamples: ['[true, "can", "is", "should"]'],
    options: {
      items: [{ type: 'string' }],
      type: 'array'
    },
    optionsDescription: 'Options accept a string array of disallowed input prefixes.',
    rationale: `HTML attributes are not prefixed. It's considered best not to prefix Inpu
    * Example: 'enabled' is prefered over 'isEnabled'.
    `,
    ruleName: 'no-input-prefix',
    type: 'maintainability',
    typescriptOnly: true
  };

  static readonly FAILURE_STRING = 'In the class "%s", the input property "%s" should not be prefixed by %s';

  apply(sourceFile: SourceFile): RuleFailure[] {
    return this.applyWithWalker(new NoInputPrefixWalker(sourceFile, this.getOptions()));
  }
}

const getReadablePrefixes = (prefixes: string[]): string => {
  const prefixesLength = prefixes.length;

  if (prefixesLength === 1) {
    return `"${prefixes[0]}"`;
  }

  return `${prefixes
    .map(x => `"${x}"`)
    .slice(0, prefixesLength - 1)
    .join(', ')} or "${[...prefixes].pop()}"`;
};

export const getFailureMessage = (className: string, propertyName: string, prefixes: string[]): string => {
  return sprintf(Rule.FAILURE_STRING, className, propertyName, getReadablePrefixes(prefixes));
};

class NoInputPrefixWalker extends NgWalker {
  private readonly blacklistedPrefixes: string[];

  constructor(source: SourceFile, options: IOptions) {
    super(source, options);
    this.blacklistedPrefixes = arrayify<string>(options.ruleArguments).slice(1);
  }

  protected visitNgInput(property: PropertyDeclaration, input: Decorator, args: string[]) {
    this.validatePrefix(property, input, args);
    super.visitNgInput(property, input, args);
  }

  private validatePrefix(property: PropertyDeclaration, input: Decorator, args: string[]) {
    const memberName = property.name.getText();
    const isBlackListedPrefix = this.blacklistedPrefixes.some(x => new RegExp(`^${x}[^a-z]`).test(memberName));

    if (!isBlackListedPrefix) {
      return;
    }

    const className = (property.parent as PropertyAccessExpression).name.getText();
    const failure = getFailureMessage(className, memberName, this.blacklistedPrefixes);

    this.addFailureAtNode(property, failure);
  }
}
