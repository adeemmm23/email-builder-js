import React from 'react';

import { FirstPageOutlined, MenuOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { toggleSamplesDrawerOpen, useSamplesDrawerOpen } from '../../documents/editor/EditorContext';

export default function ToggleSamplesPanelButton() {
  const samplesDrawerOpen = useSamplesDrawerOpen();

  return (
    <Tooltip title={samplesDrawerOpen ? 'Close Samples Panel' : 'Open Samples Panel'}>
      <IconButton onClick={toggleSamplesDrawerOpen}>
        {samplesDrawerOpen ? <FirstPageOutlined fontSize="small" /> : <MenuOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
