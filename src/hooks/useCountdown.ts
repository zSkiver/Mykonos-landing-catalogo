import { useEffect, useState } from 'react';

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  expired: boolean;
}

function split(ms: number): Countdown {
  const total = Math.max(0, ms);
  return {
    hours: Math.floor(total / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
    total,
    expired: total <= 0,
  };
}

/** Contagem regressiva de segundo em segundo até `target` (epoch ms). */
export function useCountdown(target: number): Countdown {
  const [remaining, setRemaining] = useState(() => split(target - Date.now()));

  useEffect(() => {
    setRemaining(split(target - Date.now()));
    const id = window.setInterval(() => setRemaining(split(target - Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return remaining;
}
