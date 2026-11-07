/**
 * Builds a `---`-delimited frontmatter block from a fields object.
 * @param {Object} fields Frontmatter keys and values, rendered in insertion order.
 * @returns {string}
 */
export function buildFrontmatterBlock(fields) {
	const lines = ['---'];
	for (const [key, value] of Object.entries(fields)) {
		lines.push(formatFrontmatterLine(key, value));
	}
	lines.push('---');
	return lines.join('\n');
}

/**
 * Formats one frontmatter entry as one or more lines. Arrays, plain objects, and multi-line strings render as YAML structures.
 * @param {string} key
 * @param {*} value
 * @param {number} [indent=0] Nesting depth.
 * @returns {string}
 */
function formatFrontmatterLine(
	key,
	value,
	indent = 0
) {
	const pad = '  '.repeat(indent);
	if (Array.isArray(value)) {
		if (value.length === 0) {
			return `${ pad }${ key }:`;
		}
		return `${ pad }${ key }:\n${ value.map((v) => `${ pad }  - ${ formatScalarValue(v) }`).join('\n') }`;
	}
	if (value !== null && typeof value === 'object') {
		const entries = Object.entries(value);
		if (entries.length === 0) {
			return `${ pad }${ key }:`;
		}
		const lines = entries.map(([k, v]) => formatFrontmatterLine(k, v, indent + 1));
		return `${ pad }${ key }:\n${ lines.join('\n') }`;
	}
	if (typeof value === 'string' && value.includes('\n')) {
		const blockLines = value.split('\n').map((line) => `${ pad }  ${ line }`);
		return `${ pad }${ key }: |-\n${ blockLines.join('\n') }`;
	}
	return value === undefined || value === null || value === ''
		? `${ pad }${ key }:`
		: `${ pad }${ key }: ${ formatScalarValue(value) }`;
}

/**
 * Double-quotes a string that begins with `[`. Returns any other value unchanged.
 * @param {*} value
 * @returns {*}
 */
function formatScalarValue(value) {
	if (typeof value === 'string' && value.startsWith('[')) {
		return `"${ value.replace(/"/g, '\\"') }"`;
	}
	return value;
}