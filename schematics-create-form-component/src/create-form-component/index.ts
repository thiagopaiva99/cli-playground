import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  basename,
  dirname,
  normalize,
  Path,
  strings
} from '@angular-devkit/core';

import { getValidations } from './utils/validations'

export function mySchematics(_options: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const parsedPath = parseName(_options.path, _options.name);
    _options.name = parsedPath.name;
    _options.path = parsedPath.path;

    // fields and rows are the same object, but with differents abstractions
    // fields are going to be used inside the component
    // rows are going to be used inside the template
    // of course this is a POC validation, in a real scenario it will be only one data structure

    const fields = [
      { name: 'id', validators: [] },
      { name: 'name', validators: ['Validators.required'] },
      { name: 'email', validators: ['Validators.required', 'Validators.email'] }
    ]

    const rows = [
      [{ name: 'id', type: 'hidden' }],
      [{ name: 'name', type: 'text' }],
      [{ name: 'email', type: 'email' }]
    ]

    const haveSomeValidation = fields.some(field => field.validators)

    const templateSource = apply(url('./files'), [
      renameTemplateFiles(),
      template({
        ...strings,
        ..._options,
        fields,
        rows,
        haveSomeValidation,
        getValidations,
        classify: strings.classify,
        dasherize: strings.dasherize,
        camelize: strings.camelize,
        capitalize: strings.capitalize
      }),
      move(normalize((_options.path + '/' + _options.name) as string))
    ]);

    // Return Rule chain
    return chain([branchAndMerge(chain([mergeWith(templateSource)]))])(
      tree,
      context
    );
  };
}

export function parseName(
  path: string,
  name: string
): { name: string; path: Path } {
  const nameWithoutPath = basename(name as Path);
  const namePath = dirname((path + '/' + name) as Path);

  return {
    name: nameWithoutPath,
    path: normalize('/' + namePath)
  };
}
