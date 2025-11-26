import React, { useMemo } from 'react';

import renderToStaticMarkup from '../../../email-builder/src/renderers/renderToStaticMarkup';
import { useDocument } from '../../documents/editor/EditorContext';

import HighlightedCodePanel from './helper/HighlightedCodePanel';

export default function HtmlPanel() {
  const document = useDocument();
  const code = useMemo(() => renderToStaticMarkup(document, { rootBlockId: 'root' }), [document]);
  return <HighlightedCodePanel type="html" value={code} />;
}
