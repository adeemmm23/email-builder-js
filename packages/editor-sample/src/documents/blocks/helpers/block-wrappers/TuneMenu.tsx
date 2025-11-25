import React from 'react';

import { ArrowDownwardOutlined, ArrowUpwardOutlined, CopyAllOutlined, DeleteOutlined } from '@mui/icons-material';
import { IconButton, Paper, Stack, SxProps, Tooltip } from '@mui/material';

import { TEditorBlock } from '../../../editor/core';
import { resetDocument, setSelectedBlockId, useDocument } from '../../../editor/EditorContext';
import { ColumnsContainerProps } from '../../ColumnsContainer/ColumnsContainerPropsSchema';

const sx: SxProps = {
  position: 'absolute',
  top: 0,
  left: -56,
  borderRadius: 64,
  paddingX: 0.5,
  paddingY: 0.5,
  zIndex: 'fab',
};

type Props = {
  blockId: string;
};
export default function TuneMenu({ blockId }: Props) {
  const document = useDocument();

  const handleDuplicateClick = () => {
    const generateId = () => Math.random().toString(36).substring(2, 9);

    const duplicateBlock = (originalBlockId: string): { newId: string; blocks: Record<string, TEditorBlock> } => {
      const originalBlock = document[originalBlockId];
      if (!originalBlock) return { newId: '', blocks: {} };

      const newId = generateId();
      const newBlocks: Record<string, TEditorBlock> = {};

      // Create a deep copy of the block
      let duplicatedBlock: TEditorBlock = { ...originalBlock };

      switch (originalBlock.type) {
        case 'EmailLayout':
          if (originalBlock.data.childrenIds) {
            const newChildrenIds: string[] = [];
            originalBlock.data.childrenIds.forEach((childId) => {
              const childResult = duplicateBlock(childId);
              newChildrenIds.push(childResult.newId);
              Object.assign(newBlocks, childResult.blocks);
            });
            duplicatedBlock = {
              ...originalBlock,
              data: {
                ...originalBlock.data,
                childrenIds: newChildrenIds,
              },
            };
          }
          break;

        case 'Container':
          if (originalBlock.data.props?.childrenIds) {
            const newChildrenIds: string[] = [];
            originalBlock.data.props.childrenIds.forEach((childId) => {
              const childResult = duplicateBlock(childId);
              newChildrenIds.push(childResult.newId);
              Object.assign(newBlocks, childResult.blocks);
            });
            duplicatedBlock = {
              ...originalBlock,
              data: {
                ...originalBlock.data,
                props: {
                  ...originalBlock.data.props,
                  childrenIds: newChildrenIds,
                },
              },
            };
          }
          break;

        case 'ColumnsContainer':
          if (originalBlock.data.props?.columns) {
            const newColumns = originalBlock.data.props.columns.map((column) => {
              const newChildrenIds: string[] = [];
              if (column.childrenIds) {
                column.childrenIds.forEach((childId) => {
                  const childResult = duplicateBlock(childId);
                  newChildrenIds.push(childResult.newId);
                  Object.assign(newBlocks, childResult.blocks);
                });
              }
              return { childrenIds: newChildrenIds };
            });
            duplicatedBlock = {
              type: 'ColumnsContainer',
              data: {
                style: originalBlock.data.style,
                props: {
                  ...originalBlock.data.props,
                  columns: newColumns,
                },
              } as ColumnsContainerProps,
            };
          }
          break;

        default:
          // For other block types, just copy the block as-is
          duplicatedBlock = { ...originalBlock };
      }

      newBlocks[newId] = duplicatedBlock;
      return { newId, blocks: newBlocks };
    };

    // Find the parent container and insert the duplicated block
    const insertDuplicatedBlock = (childrenIds: string[] | null | undefined, targetId: string) => {
      if (!childrenIds) return childrenIds;
      const index = childrenIds.indexOf(targetId);
      if (index < 0) return childrenIds;

      const result = duplicateBlock(targetId);
      const newChildrenIds = [...childrenIds];
      newChildrenIds.splice(index + 1, 0, result.newId);

      // Add all new blocks to the document
      Object.assign(nDocument, result.blocks);

      return newChildrenIds;
    };

    const nDocument: typeof document = { ...document };

    // Update parent containers to include the duplicated block
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) continue;

      switch (block.type) {
        case 'EmailLayout': {
          const newEmailLayoutChildrenIds = insertDuplicatedBlock(block.data.childrenIds, blockId);
          if (newEmailLayoutChildrenIds !== block.data.childrenIds) {
            nDocument[id] = {
              ...block,
              data: {
                ...block.data,
                childrenIds: newEmailLayoutChildrenIds,
              },
            };
          }
          break;
        }

        case 'Container': {
          const newContainerChildrenIds = insertDuplicatedBlock(block.data.props?.childrenIds, blockId);
          if (newContainerChildrenIds !== block.data.props?.childrenIds) {
            nDocument[id] = {
              ...block,
              data: {
                ...block.data,
                props: {
                  ...block.data.props,
                  childrenIds: newContainerChildrenIds,
                },
              },
            };
          }
          break;
        }

        case 'ColumnsContainer': {
          let columnsChanged = false;
          const newColumns = block.data.props?.columns?.map((c) => {
            const newColumnChildrenIds = insertDuplicatedBlock(c.childrenIds, blockId);
            if (newColumnChildrenIds !== c.childrenIds) {
              columnsChanged = true;
              return { childrenIds: newColumnChildrenIds };
            }
            return c;
          });

          if (columnsChanged) {
            nDocument[id] = {
              type: 'ColumnsContainer',
              data: {
                style: block.data.style,
                props: {
                  ...block.data.props,
                  columns: newColumns,
                },
              } as ColumnsContainerProps,
            };
          }
          break;
        }
      }
    }

    resetDocument(nDocument);
  };

  const handleDeleteClick = () => {
    const filterChildrenIds = (childrenIds: string[] | null | undefined) => {
      if (!childrenIds) {
        return childrenIds;
      }
      return childrenIds.filter((f) => f !== blockId);
    };
    const nDocument: typeof document = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }
      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: filterChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case 'Container':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: filterChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case 'ColumnsContainer':
          nDocument[id] = {
            type: 'ColumnsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c) => ({
                  childrenIds: filterChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }
    delete nDocument[blockId];
    resetDocument(nDocument);
  };

  const handleMoveClick = (direction: 'up' | 'down') => {
    const moveChildrenIds = (ids: string[] | null | undefined) => {
      if (!ids) {
        return ids;
      }
      const index = ids.indexOf(blockId);
      if (index < 0) {
        return ids;
      }
      const childrenIds = [...ids];
      if (direction === 'up' && index > 0) {
        [childrenIds[index], childrenIds[index - 1]] = [childrenIds[index - 1], childrenIds[index]];
      } else if (direction === 'down' && index < childrenIds.length - 1) {
        [childrenIds[index], childrenIds[index + 1]] = [childrenIds[index + 1], childrenIds[index]];
      }
      return childrenIds;
    };
    const nDocument: typeof document = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }
      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: moveChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case 'Container':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: moveChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case 'ColumnsContainer':
          nDocument[id] = {
            type: 'ColumnsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c) => ({
                  childrenIds: moveChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }

    resetDocument(nDocument);
    setSelectedBlockId(blockId);
  };

  return (
    <Paper sx={sx} onClick={(ev) => ev.stopPropagation()}>
      <Stack>
        <Tooltip title="Move up" placement="left-start">
          <IconButton
            onClick={() => handleMoveClick('up')}
            sx={{ color: 'text.primary', paddingY: 1.5, borderRadius: 50 }}
          >
            <ArrowUpwardOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move down" placement="left-start">
          <IconButton
            onClick={() => handleMoveClick('down')}
            sx={{ color: 'text.primary', paddingY: 1.5, borderRadius: 50 }}
          >
            <ArrowDownwardOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate" placement="left-start">
          <IconButton onClick={handleDuplicateClick} sx={{ color: 'text.primary', paddingY: 1.5, borderRadius: 50 }}>
            <CopyAllOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" placement="left-start">
          <IconButton onClick={handleDeleteClick} sx={{ color: 'text.primary', paddingY: 1.5, borderRadius: 50 }}>
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
