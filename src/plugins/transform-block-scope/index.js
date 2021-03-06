/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @typedef {import('@babel/core')} babel */

/**
 * Infer `let` usage from `var.
 * @param {babel} api
 * @returns {babel.PluginObj}
 */
export default function({}) {
	return {
		name: 'transform-block-scpe',
		visitor: {
			VariableDeclaration(path) {
				if (path.node.kind !== 'var') return;

				const idents = path.getBindingIdentifierPaths();
				for (const name in idents) {
					const p = idents[name];
					const b = p.scope.getBinding(name);
					// unknown binding / free global / non-constant
					if (!b || !b.constant) return;
					// TDZ violations
					for (const ref of b.referencePaths) {
						if (ref !== p && ref.willIMaybeExecuteBefore(p)) {
							return;
						}
					}
				}
				path.node.kind = 'let';
			}
		}
	};
}
