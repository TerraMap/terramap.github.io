import { LeftOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table } from 'antd';
import { useState } from 'react';
import firstBy from 'thenby';
import { readPlayerMap, type PlayerMap } from '../lib/readPlayerMap';
import { readWorldHeader } from '../lib/readWorldHeader';
import { formatBytes } from '../lib/string';
import type { DirectoryFiles } from './Navbar';

interface DirectoryPickerModalProps {
  open: boolean;
  directoryFiles: DirectoryFiles | undefined;
  onClose: () => void;
  onWorldSelected: (file: File, playerMap: PlayerMap | null) => void;
}

export function DirectoryPickerModal({ open, directoryFiles, onClose, onWorldSelected }: DirectoryPickerModalProps) {
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
    if (pendingWorldFile) onWorldSelected(pendingWorldFile, parsed);
  };

  const handleSkipMap = () => {
    handleClose();
    if (pendingWorldFile) onWorldSelected(pendingWorldFile, null);
  };

  return (
    <Modal
      title={step === 'world' ? 'Select a World File' : 'Select a Player Map (Optional)'}
      open={open}
      onCancel={handleClose}
      width={800}
      footer={step === 'map' ? (
        <Space orientation="vertical">
          <div style={{ textAlign: 'left' }}>
            Pick a player map to avoid spoilers. TerraMap will show only what that player has seen in the world.
          </div>
          <Space>
            <Button icon={<LeftOutlined />}
              onClick={() => setStep('world')}>
              Select a different world
            </Button>
            <Button danger onClick={handleSkipMap}>
              Show all spoilers
            </Button>
          </Space>
        </Space>
      ) : null}
    >
      {step === 'world' && (
        <Table
          dataSource={directoryFiles?.worldFiles}
          pagination={false}
          rowKey="name"
          size="small"
          onRow={(file) => ({
            onClick: () => { handleWorldClick(file) }
          })}
          columns={[
            {
              dataIndex: 'name',
              title: "File",
              sorter: firstBy('name'),
              onCell: () => ({ style: { cursor: 'pointer' } })
            },
            {
              dataIndex: 'size',
              sorter: firstBy('size'),
              title: "Size",
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (size?: number) => formatBytes(size),
            },
            {
              dataIndex: 'lastModified',
              defaultSortOrder: 'descend',
              sorter: firstBy('lastModified'),
              title: 'Modified',
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
          rowKey="name"
          size="small"
          onRow={(file) => ({
            onClick: () => { handleMapClick(file) }
          })}
          columns={[
            {
              dataIndex: 'name',
              title: "Name",
              sorter: firstBy('name'),
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (name: string, file) => {
                const parts = file.webkitRelativePath?.split('/');
                return parts ? parts[parts.length - 2] : file.name;
              }
            },
            {
              dataIndex: 'name',
              sorter: firstBy('name'),
              title: "File",
              onCell: () => ({ style: { cursor: 'pointer' } })
            },
            {
              dataIndex: 'size',
              sorter: firstBy('size'),
              title: "Size",
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (size?: number) => formatBytes(size),
            },
            {
              dataIndex: 'lastModified',
              defaultSortOrder: 'descend',
              sorter: firstBy('lastModified'),
              title: 'Modified',
              onCell: () => ({ style: { cursor: 'pointer' } }),
              render: (lastModified: number) => new Date(lastModified).toLocaleString(),
            }
          ]}
        />
      )}
    </Modal>
  );
}
