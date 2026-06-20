<script setup lang="ts">
// Ambient field: three slow-drifting light pools tinted by the active accent.
// Pure CSS animation — GPU-composited via will-change: transform.
</script>

<template>
  <div class="ambient" aria-hidden="true">
    <div class="pool pool-a" />
    <div class="pool pool-b" />
    <div class="pool pool-c" />
    <div class="noise" />
    <div class="vignette" />
  </div>
</template>

<style scoped>
.ambient {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: var(--bg);
}

/* Shared pool base */
.pool {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;
  transition: background var(--dur) var(--ease);
}

/* Primary pool — top-left, accent glow */
.pool-a {
  width: 70vmax;
  height: 70vmax;
  top: -28vmax;
  left: -18vmax;
  background: radial-gradient(circle at 45% 45%,
    rgba(var(--c-rgb), 0.32) 0%,
    rgba(var(--c-rgb), 0.10) 48%,
    transparent 70%
  );
  animation: drift-a 28s ease-in-out infinite alternate;
}

/* Secondary pool — bottom-right, softer */
.pool-b {
  width: 65vmax;
  height: 65vmax;
  bottom: -24vmax;
  right: -18vmax;
  background: radial-gradient(circle at 55% 55%,
    rgba(var(--c-rgb), 0.22) 0%,
    rgba(var(--c-rgb), 0.06) 52%,
    transparent 72%
  );
  animation: drift-b 36s ease-in-out infinite alternate;
}

/* Tertiary pool — center-right, subtle */
.pool-c {
  width: 44vmax;
  height: 44vmax;
  top: 24vmax;
  left: 42vmax;
  background: radial-gradient(circle at 50% 50%,
    rgba(var(--c-rgb), 0.16) 0%,
    transparent 68%
  );
  opacity: 0.6;
  animation: drift-c 42s ease-in-out infinite alternate;
}

@keyframes drift-a {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(6vmax, 5vmax, 0) scale(1.08); }
  100% { transform: translate3d(12vmax, 10vmax, 0) scale(1.16); }
}
@keyframes drift-b {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(-7vmax, -4vmax, 0) scale(1.06); }
  100% { transform: translate3d(-14vmax, -8vmax, 0) scale(1.12); }
}
@keyframes drift-c {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  100% { transform: translate3d(-9vmax, 8vmax, 0) scale(0.82); }
}

/* Fine noise overlay */
.noise {
  position: absolute;
  inset: 0;
  opacity: 0.055;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  pointer-events: none;
}

/* Vignette — edges to center */
.vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(110% 85% at 50% 42%, transparent 52%, var(--vignette) 100%);
  pointer-events: none;
}
</style>
