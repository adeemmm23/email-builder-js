import React, { useMemo, useState } from 'react';

import { CheckOutlined, ContentCopyOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { renderToStaticMarkup } from '@usewaypoint/email-builder';

import { useDocument } from '../../../documents/editor/EditorContext';

export default function CopyRich() {
  const doc = useDocument();
  const [copied, setCopied] = useState(false);

  const htmlContent = useMemo(() => {
    return renderToStaticMarkup(doc, { rootBlockId: 'root' });
  }, [doc]);

  const handleCopyRich = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([htmlContent.replace(/<[^>]*>/g, '')], { type: 'text/plain' });

        const clipboardItem = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        });

        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(htmlContent);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      try {
        await navigator.clipboard.writeText(htmlContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy as Rich Text'}>
      <IconButton onClick={handleCopyRich} color={copied ? 'success' : 'default'}>
        {copied ? <CheckOutlined fontSize="small" /> : <ContentCopyOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
