import { S } from "../constants";

export default function DiscBadge({ pct }) {
  return <span style={S.discBadge}>−{pct}%</span>;
}
