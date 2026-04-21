export const fmtTime = (mins) => {
  if (mins < 1) return "Завершено";
  if (mins < 60) return `${mins} мин`;
  return `${Math.floor(mins / 60)}ч ${mins % 60}м`;
};
