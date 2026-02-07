const env = (import.meta.env.VITE_WEEK_STARTS_ON || '').toString().toLowerCase();

export const weekStartsOn: 0 | 1 = env === 'sunday' ? 0 : 1;
