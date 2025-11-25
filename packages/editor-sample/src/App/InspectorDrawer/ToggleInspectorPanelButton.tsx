import React from 'react';

import { LastPageOutlined, TuneOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { toggleInspectorDrawerOpen, useInspectorDrawerOpen } from '../../documents/editor/EditorContext';

export default function ToggleInspectorPanelButton() {
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  return (
    <Tooltip title={inspectorDrawerOpen ? 'Close Inspector Panel' : 'Open Inspector Panel'}>
      <IconButton onClick={toggleInspectorDrawerOpen}>
        {inspectorDrawerOpen ? <LastPageOutlined fontSize="small" /> : <TuneOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
