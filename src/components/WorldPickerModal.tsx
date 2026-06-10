import { CloudOutlined, LeftOutlined } from '@ant-design/icons';
import { App, Button, Modal, Space, Table, Tooltip } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import firstBy from 'thenby';
import useFetchPlayers, { type PlayerEntry } from '../hooks/useFetchPlayers';
import useFetchWorlds from '../hooks/useFetchWorlds';
import { readFile as nativeReadFile, type WorldEntry } from '../lib/native';
import { readPlayerMap, type PlayerMap } from '../lib/readPlayerMap';
import { formatBytes } from '../lib/string';

interface WorldPickerModalProps {
  open: boolean;
  onClose: () => void;
  onWorldSelected: (file: File, mapFile: File | null, playerMap: PlayerMap | null) => void;
  nativeReady?: boolean;
}

export function WorldPickerModal({ open, onClose, onWorldSelected, nativeReady }: WorldPickerModalProps) {
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const [step, setStep] = useState<'world' | 'player'>('world');
  const [pendingWorld, setPendingWorld] = useState<WorldEntry | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { loading: loadingWorlds, data: worlds } = useFetchWorlds(!!nativeReady);
  const { loading: loadingPlayers, data: players, execute: loadPlayers } = useFetchPlayers();

  const handleClose = () => {
    onClose();
    setStep('world');
  };

  const handleWorldClick = async (world: WorldEntry) => {
    setPendingWorld(world);
    setStep('player');
    await loadPlayers(world);
  };

  const handleLoadWorld = async (world: WorldEntry, player: PlayerEntry | null) => {
    setDownloading(true);
    try {
      const worldFile = await nativeReadFile(world.path);
      let mapFile: File | null = null;
      let playerMap: PlayerMap | null = null;
      if (player) {
        mapFile = await nativeReadFile(player.path);
        playerMap = await readPlayerMap(mapFile);
      }
      handleClose();
      onWorldSelected(worldFile, mapFile, playerMap);
    } catch (e) {
      const message = !!e && typeof e === 'object' && 'message' in e && typeof e.message === 'string' ? e.message : 'unknown';
      notification.error({ key: 'error', title: t('error_loading_world', { message }), placement: 'bottomRight', duration: 0 });
    } finally {
      setDownloading(false);
    }
  };

  const handleMapClick = async (player: PlayerEntry) => {
    if (pendingWorld) await handleLoadWorld(pendingWorld, player);
  };

  const handleSkipMap = async () => {
    if (pendingWorld) await handleLoadWorld(pendingWorld, null);
  };

  return (
    <Modal
      title={step === 'world' ? t('select_world_file') : t('select_player_map_optional')}
      open={open}
      onCancel={handleClose}
      width={800}
      closable={!downloading}
      footer={step === 'player' ? (
        <Space orientation="vertical">
          <div style={{ textAlign: 'left' }}>
            {t('player_map_description')}
          </div>
          <Space>
            <Button icon={<LeftOutlined />}
              disabled={downloading}
              onClick={() => setStep('world')}>
              {t('select_different_world')}
            </Button>
            <Button danger disabled={downloading} loading={downloading} onClick={handleSkipMap}>
              {t('show_all_spoilers')}
            </Button>
          </Space>
        </Space>
      ) : null}
    >
      {step === 'world' && (
        <Table
          dataSource={worlds ?? []}
          loading={loadingWorlds}
          pagination={false}
          rowKey="path"
          size="small"
          onRow={(world) => ({
            onClick: () => { void handleWorldClick(world); }
          })}
          columns={[
            {
              dataIndex: 'path',
              title: t('file'),
              sorter: firstBy('name'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (path: string, world) => {
                const cloud = path.includes('remote');
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
            },
            {
              dataIndex: 'seed',
              sorter: firstBy('seed'),
              title: t('seed'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
            },
            {
              dataIndex: 'width',
              sorter: firstBy('width'),
              title: t('size'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (width: number, world) => <Tooltip title={`${width.toLocaleString()} x ${world.height.toLocaleString()}`}>{width <= 4_200 ? t('small') : width <= 6_400 ? t('medium') : t('large')}</Tooltip>
            },
            {
              dataIndex: 'version',
              sorter: firstBy('version'),
              title: t('version'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
            },
          ]}
        />
      )}

      {step === 'player' && (
        <Table
          dataSource={players ?? []}
          loading={loadingPlayers || downloading}
          pagination={false}
          rowKey="path"
          size="small"
          onRow={(file) => ({
            onClick: () => { void handleMapClick(file) }
          })}
          columns={[
            {
              dataIndex: 'playerName',
              title: t('file'),
              sorter: firstBy('name'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (playerName: string, player) => {
                const cloud = player.path.includes('remote');
                return (
                  <Space>
                    <Tooltip title={player.path}>
                      {playerName}
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
