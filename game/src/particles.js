// Creates and advances deterministic particles for prep and serving feedback.
export function burst(state, x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = state.visualRandom() * Math.PI * 2;
    const speed = 30 + state.visualRandom() * 90;
    state.particles.push({
      x, y, color, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed - 40,
      left: .27 + state.visualRandom() * .26,
    });
  }
}

export function moveParticles(state, dt) {
  for (const bit of state.particles) {
    bit.x += bit.dx * dt;
    bit.y += bit.dy * dt;
    bit.dy += 185 * dt;
    bit.left -= dt;
  }
  state.particles = state.particles.filter(bit => bit.left > 0);
}
