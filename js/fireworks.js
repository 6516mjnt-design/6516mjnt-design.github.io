/*
 * 花火エフェクト（背景の粒子・星の上に重ねる専用レイヤー）
 * - 既存の particles.js / background-rotator.js には触れません。
 * - 色や頻度は下の CONFIG で調整できます。
 * - 「視覚効果を減らす」設定の端末では自動的に止まります。
 */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var CONFIG = {
    launchInterval: [900, 2600],      // 次の花火までの待ち時間（ms）
    maxRockets: 3,                    // 同時に打ち上がる数
    rocketSpeed: [6, 9],              // 上昇速度（px/frame）
    burstSize: [45, 80],              // 1発あたりの火花の数
    burstSpeed: [1.6, 4.6],           // 火花の初速
    gravity: 0.035,
    drag: 0.975,
    decay: [0.011, 0.02],             // 火花が消えていく速さ
    sparkRadius: [1.1, 2.2],
    maxSparks: 900,
    colors: ['#7fd8ff', '#ffd76a', '#4f7cff', '#ffffff', '#ff9ad5', '#b8ff9f']
  };

  var canvas = document.createElement('canvas');
  canvas.id = 'fireworks-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';

  // particles-js の直後に置く（#wrapper の z-index:1 より下、背景より上）
  var particles = document.getElementById('particles-js');
  if (particles && particles.parentNode) {
    particles.parentNode.insertBefore(canvas, particles.nextSibling);
  } else {
    document.body.insertBefore(canvas, document.body.firstChild);
  }

  var ctx = canvas.getContext('2d');
  var w = 0, h = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var rockets = [];
  var sparks = [];
  var nextLaunchAt = 0;
  var running = false;
  var rafId = null;

  function burst(x, y, color) {
    var count = Math.floor(rand(CONFIG.burstSize[0], CONFIG.burstSize[1]));
    // 1発ごとに「同系色」か「ランダム色」かを決めて変化をつける
    var mixed = Math.random() < 0.35;
    for (var i = 0; i < count; i++) {
      if (sparks.length >= CONFIG.maxSparks) break;
      var angle = Math.random() * Math.PI * 2;
      var speed = rand(CONFIG.burstSpeed[0], CONFIG.burstSpeed[1]);
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: rand(CONFIG.decay[0], CONFIG.decay[1]),
        size: rand(CONFIG.sparkRadius[0], CONFIG.sparkRadius[1]),
        color: mixed ? pick(CONFIG.colors) : color
      });
    }
  }

  function launch() {
    if (rockets.length >= CONFIG.maxRockets) return;
    var targetY = rand(h * 0.12, h * 0.45);
    rockets.push({
      x: rand(w * 0.1, w * 0.9),
      y: h + 4,
      vy: -rand(CONFIG.rocketSpeed[0], CONFIG.rocketSpeed[1]),
      targetY: targetY,
      color: pick(CONFIG.colors),
      trail: []
    });
  }

  function drawRocket(r) {
    var len = r.trail.length;
    for (var i = 1; i < len; i++) {
      var a = (i / len) * 0.6;
      ctx.globalAlpha = a;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(r.trail[i - 1].x, r.trail[i - 1].y);
      ctx.lineTo(r.trail[i].x, r.trail[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r.x, r.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(t) {
    if (t >= nextLaunchAt) {
      launch();
      nextLaunchAt = t + rand(CONFIG.launchInterval[0], CONFIG.launchInterval[1]);
    }

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    // 打ち上げ中の花火
    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.y += r.vy;
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 14) r.trail.shift();
      drawRocket(r);
      if (r.y <= r.targetY) {
        burst(r.x, r.y, r.color);
        rockets.splice(i, 1);
      }
    }

    // 飛び散る火花
    for (var j = sparks.length - 1; j >= 0; j--) {
      var s = sparks[j];
      s.vx *= CONFIG.drag;
      s.vy = s.vy * CONFIG.drag + CONFIG.gravity;
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0 || s.y > h + 10) {
        sparks.splice(j, 1);
        continue;
      }
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.5 + s.life * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (running) rafId = window.requestAnimationFrame(frame);
  }


  // 外部スクリプトから手動で打ち上げたい場合の窓口
  // 背景ローテーションから start / stop で切り替える（既定では動かない）
  function start() {
    if (running) return;
    running = true;
    nextLaunchAt = 0;
    rafId = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = null;
    rockets = [];
    sparks = [];
    ctx.clearRect(0, 0, w, h);
  }

  window.fireworks = {
    start: start,
    stop: stop,
    launch: launch,
    burstAt: function (x, y) { burst(x, y, pick(CONFIG.colors)); }
  };
})();
