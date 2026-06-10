import { CloudOutlined, LeftOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, Tooltip } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import firstBy from 'thenby';
import { readPlayerMap, type PlayerMap } from '../lib/readPlayerMap';
import { readWorldHeader } from '../lib/readWorldHeader';
import { formatBytes } from '../lib/string';
import type { DirectoryFiles } from './Navbar';

interface DirectoryPickerModalProps {
  open: boolean;
  directoryFiles: DirectoryFiles | undefined;
  onClose: () => void;
  onWorldSelected: (file: File, mapFile: File | null, playerMap: PlayerMap | null) => void;
}

export function DirectoryPickerModal({ open, directoryFiles, onClose, onWorldSelected }: DirectoryPickerModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'world' | 'map'>('world');
  const [matchedMapFiles, setMatchedMapFiles] = useState<File[]>([]);
  const [pendingWorldFile, setPendingWorldFile] = useState<File | null>(null);

  const handleClose = () => {
    onClose();
    setStep('world');
  };

  const handleWorldClick = async (file: File) => {
    let matched: File[] = [];
    try {
      const slice = file.slice(0, 64 * 1024);
      const buffer = await slice.arrayBuffer();
      const { uniqueId, id } = readWorldHeader(buffer);
      const mapFiles = directoryFiles?.mapFiles ?? [];
      matched = mapFiles.filter(f =>
        f.name === `${uniqueId}.map` || f.name === `${id}.map`
      );
    } catch {
      // corrupted or truncated file — proceed without map matching
    }
    setPendingWorldFile(file);
    setMatchedMapFiles(matched);
    setStep('map');
  };

  const handleMapClick = async (file: File) => {
    handleClose();
    const parsed = await readPlayerMap(file);
    if (pendingWorldFile) onWorldSelected(pendingWorldFile, file, parsed);
  };

  const handleSkipMap = () => {
    handleClose();
    if (pendingWorldFile) onWorldSelected(pendingWorldFile, null, null);
  };

  return (
    <Modal
      title={step === 'world' ? t('select_world_file') : t('select_player_map_optional')}
      open={open}
      onCancel={handleClose}
      width={800}
      footer={step === 'map' ? (
        <Space orientation="vertical">
          <div style={{ textAlign: 'left' }}>
            {t('player_map_description')}
          </div>
          <Space>
            <Button icon={<LeftOutlined />}
              onClick={() => setStep('world')}>
              {t('select_different_world')}
            </Button>
            <Button danger onClick={handleSkipMap}>
              {t('show_all_spoilers')}
            </Button>
          </Space>
        </Space>
      ) : null}
    >
      {step === 'world' && (
        <Table
          dataSource={directoryFiles?.worldFiles}
          pagination={false}
          rowKey="webkitRelativePath"
          size="small"
          onRow={(file) => ({
            onClick: () => { void handleWorldClick(file) }
          })}
          columns={[
            {
              dataIndex: 'webkitRelativePath',
              title: t('file'),
              sorter: firstBy('name'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (path: string, world) => {
                const cloud = path?.includes('remote');
                return (
                  <Space>
                    <Tooltip title={path}>
                      {world.name}
                    </Tooltip>

                    {cloud && (
                      <Tooltip title={cloud ? t('steam_cloud') : t('local')}>
                        <CloudOutlined />
                      </Tooltip>
                    )}
                  </Space>
                );
              }
            },
            {
              dataIndex: 'size',
              sorter: firstBy('size'),
              title: t('size'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (size?: number) => formatBytes(size),
            },
            {
              dataIndex: 'lastModified',
              defaultSortOrder: 'descend',
              sorter: firstBy('lastModified'),
              title: t('modified'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (lastModified: number) => new Date(lastModified).toLocaleString(),
            }
          ]}
        />
      )}

      {step === 'map' && (
        <Table
          dataSource={matchedMapFiles}
          pagination={false}
          rowKey="webkitRelativePath"
          size="small"
          onRow={(file) => ({
            onClick: () => { void handleMapClick(file) }
          })}
          columns={[
            {
              dataIndex: 'name',
              title: t('name'),
              sorter: firstBy('name'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (name: string, file) => {
                const parts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : undefined;
                return parts ? parts[parts.length - 2] : file.name;
              }
            },
            {
              dataIndex: 'webkitRelativePath',
              sorter: firstBy('name'),
              title: t('file'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (path: string, player) => {
                const cloud = path.includes('remote');
                return (
                  <Space>
                    <Tooltip title={path}>
                      {player.name}
                    </Tooltip>

                    {cloud && (
                      <Tooltip title={cloud ? t('steam_cloud') : t('local')}>
                        <CloudOutlined />
                      </Tooltip>
                    )}
                  </Space>
                );
              }
            },
            {
              dataIndex: 'size',
              sorter: firstBy('size'),
              title: t('size'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (size?: number) => formatBytes(size),
            },
            {
              dataIndex: 'lastModified',
              defaultSortOrder: 'descend',
              sorter: firstBy('lastModified'),
              title: t('modified'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (lastModified: number) => new Date(lastModified).toLocaleString(),
            }
          ]}
        />
      )}
    </Modal>
  );
}
