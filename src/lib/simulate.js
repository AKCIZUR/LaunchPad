function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function noise(seed) {
  const x = Math.sin(seed * 999.123 + 17.7) * 43758.5453;
  return x - Math.floor(x);
}

export function createTrafficModel(apps) {
  const state = new Map();

  for (const app of apps) {
    const baseUsers = Number(app.baseUsers || 0);
    const baseLatency = Number(app.baseLatency || 0);
    state.set(app.id, {
      users: baseUsers,
      latency: baseLatency,
      delta: 0,
      tick: 0,
      glow: noise(baseUsers + baseLatency),
    });
  }

  const step = () => {
    for (const app of apps) {
      const s = state.get(app.id);
      if (!s) continue;
      s.tick += 1;

      const wave = Math.sin((s.tick + app.id.length) / 3.5);
      const drift = (noise(s.tick + app.id.length) - 0.5) * 18;
      s.delta = clamp(s.delta + drift / 8, -28, 28);
      s.users = clamp(Math.round(Number(app.baseUsers) + wave * 18 + s.delta), 8, 999);
      s.latency = clamp(Math.round(Number(app.baseLatency) + Math.cos((s.tick + app.id.length) / 4.4) * 7 + drift * 0.25), 8, 180);
      s.glow = clamp(noise(s.tick * 0.7 + app.baseUsers) + 0.25, 0.2, 1);
    }
  };

  step();
  const timer = window.setInterval(step, 2200);

  return {
    getSnapshot(id) {
      return state.get(id) || { users: 0, latency: 0, glow: 0.3 };
    },
    stop() {
      window.clearInterval(timer);
    },
  };
}
