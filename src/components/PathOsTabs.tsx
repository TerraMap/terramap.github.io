import { Tabs, Typography } from "antd";
import type { OS, PathEntry } from "../hooks/useDetectOS";
import Copyable from "./Copyable";

const { Text } = Typography;

function PathEntryItem({ item: { label, path, copyPath } }: { item: PathEntry }) {
  return (
    <li>
      {label ? (<><Text strong>{label}</Text>: </>) : ''}<Copyable label={path} copyText={copyPath} />
    </li>
  );
}

export default function PathOsTabs({ userOS, paths }: { userOS: OS, paths: PathEntry[] }) {
  return (
    <Tabs defaultActiveKey={userOS} items={[
      {
        key: 'linux',
        label: "Linux",
        children:
          <ul>
            {paths.filter(p => p.os === 'linux').map(p => (
              <PathEntryItem item={p} key={p.label} />
            ))}
          </ul>
      },
      {
        key: 'macos',
        label: "MacOS",
        children:
          <ul>
            {paths.filter(p => p.os === 'macos').map(p => (
              <PathEntryItem item={p} key={p.label} />
            ))}
          </ul>
      },
      {
        key: 'windows',
        label: "Windows",
        children:
          <ul>
            {paths.filter(p => p.os === 'windows').map(p => (
              <PathEntryItem item={p} key={p.label} />
            ))}
          </ul>
      }
    ]} />);
}
