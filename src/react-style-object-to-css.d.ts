declare module 'react-style-object-to-css' {
	import type { CSSProperties } from 'react';
	function styleToCssString(cssStyle: CSSProperties): string;
	export = styleToCssString;
}
