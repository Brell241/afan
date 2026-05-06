export const LEVELS = [
  { id: 0, name: 'Visiteur',   min: 0,  color: '#686868', emoji: '🌱' },
  { id: 1, name: 'Découvreur', min: 1,  color: '#4a9e6b', emoji: '🎵' },
  { id: 2, name: 'Mélomane',   min: 5,  color: '#4a7fc1', emoji: '🎶' },
  { id: 3, name: 'Gardien',    min: 15, color: '#9b59b6', emoji: '🌿' },
  { id: 4, name: 'Archiviste', min: 30, color: '#e67e22', emoji: '📚' },
  { id: 5, name: 'Griot',      min: 50, color: '#e85d7e', emoji: '🪘' },
] as const;

export type Level = (typeof LEVELS)[number];

export function getLevel(approvedCount: number): Level {
  return [...LEVELS].reverse().find((l) => approvedCount >= l.min) ?? LEVELS[0];
}
