import { Button, List, Modal, Space } from 'antd';
import { useState } from 'react';
import { readPlayerMap, type PlayerMap } from '../lib/readPlayerMap';
import { readWorldIds } from '../lib/readWorldIds';
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
    const { uniqueId, id } = await readWorldIds(file);
    const mapFiles = directoryFiles?.mapFiles ?? [];
    const matched = mapFiles.filter(f =>
      f.name === `${uniqueId}.map` || f.name === `${id}.map`
    );
    setPendingWorldFile(file);
    if (matched.length > 0) {
      setMatchedMapFiles(matched);
      setStep('map');
    } else {
      handleClose();
      onWorldSelected(file, null);
    }
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
      footer={step === 'map' ? (
        <Space orientation="vertical">
          <div style={{ textAlign: 'left' }}>
            Pick a player map to avoid spoilers. TerraMap will show only what that player has seen in the world.
          </div>
          <Button danger onClick={handleSkipMap}>
            Show all spoilers
          </Button>
        </Space>
      ) : null}
    >
      {step === 'world' && (
        <List
          dataSource={directoryFiles?.worldFiles}
          renderItem={(file) => (
            <List.Item>
              <Button type="text" onClick={() => handleWorldClick(file)}>
                {file.name}
              </Button>
            </List.Item>
          )}
        />
      )}
      {step === 'map' && (
        <List
          dataSource={matchedMapFiles}
          renderItem={(file) => (
            <List.Item>
              <Button type="text" onClick={() => handleMapClick(file)}>
                {(() => { const parts = file.webkitRelativePath?.split('/'); return parts ? parts[parts.length - 2] : file.name; })()}
              </Button>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}
