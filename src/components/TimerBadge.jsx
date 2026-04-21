import { S } from "../constants";
import { fmtTime } from "../utils";

export default function TimerBadge({ mins }) {
  return (
    <span style={mins < 60 ? S.timerUrgent : S.timerNormal}>
      ⏱ {fmtTime(mins)}
    </span>
  );
}
