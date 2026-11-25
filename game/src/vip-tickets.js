// VIP tickets have a separate, shorter clock for earning bonus tips.
export function vipClock(number, elapsed) {
  return elapsed >= 55 && number % 3 === 0 ? vipSeconds : null;
}

export function vipTip(ticket) {
  return ticket.vipLeft > 0 ? 24 : 0;
}

export const vipSeconds = 34;
