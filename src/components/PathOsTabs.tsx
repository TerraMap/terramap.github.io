import { Tabs, Typography } from "antd";
import type { OS, PathEntry } from "../hooks/useDetectOS";
import Copyable from "./Copyable";

const { Text } = Typography;

const OS_TABS: { key: OS, label: string }[] = [
  { key: 'linux', label: "Linux" },
  { key: 'macos', label: "MacOS" },
  { key: 'windows', label: "Windows" },
  { key: 'android', label: "Android" },
];

function PathEntryItem({ item: { label, path, copyPath } }: { item: PathEntry }) {
  return (
    <li>
      {label ? (<><Text strong>{label}</Text>: </>) : ''}<Copyable label={path} copyText={copyPath} />
    </li>
  );
}

export default function PathOsTabs({ userOS, paths }: { userOS: OS, paths: PathEntry[] }) {
  return (
    <Tabs defaultActiveKey={userOS} items={OS_TABS.map(({ key, label }) => ({
      key,
      label,
      children:
        <ul>
          {paths.filter(p => p.os === key).map(p => (
            <PathEntryItem item={p} key={p.label} />
          ))}
        </ul>
    }))} />);
}
