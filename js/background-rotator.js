/* ============================================================
   background-rotator.js
   ISO週番号に応じて particles.js の演出パターンを自動で切り替える。
   毎週手動で更新する必要はなし。プリセットを増やしたいときは
   presets 配列に新しいオブジェクトを push するだけでOK。
   ============================================================ */

(function () {

  /* ---------- ISO週番号を計算する ---------- */
  function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /* ---------- プリセット定義（10種類） ---------- */

  // 1. ネットワーク（現状の青系ライン演出）
  const presetNetwork = {
    particles: {
      number: { value: 140, density: { enable: true, value_area: 800 } },
      color: { value: "#7fd8ff" },
      shape: { type: "circle" },
      opacity: { value: 0.8, random: false },
      size: { value: 4.5, random: true },
      line_linked: { enable: true, distance: 150, color: "#4f7cff", opacity: 0.6, width: 1.5 },
      move: { enable: true, speed: 1.5, direction: "none", random: false, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { grab: { distance: 140, line_linked: { opacity: 0.6 } }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  };

  // 2. 星空（きらめく点、線なし）
  const presetStars = {
    particles: {
      number: { value: 240, density: { enable: true, value_area: 900 } },
      color: { value: "#ffd76a" },
      shape: { type: "circle" },
      opacity: { value: 0.95, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
      size: { value: 3, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 0.3, direction: "none", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: false }, resize: true },
      modes: { bubble: { distance: 120, size: 4, duration: 2, opacity: 1 } }
    },
    retina_detect: true
  };

  // 3. 泡（上昇するバブル）
  const presetBubbles = {
    particles: {
      number: { value: 100, density: { enable: true, value_area: 800 } },
      color: { value: "#7fd8ff" },
      shape: { type: "circle" },
      opacity: { value: 0.56, random: true },
      size: { value: 12, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 2, direction: "top", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "bubble" }, resize: true },
      modes: { repulse: { distance: 100 }, bubble: { distance: 200, size: 12, duration: 2, opacity: 0.6 } }
    },
    retina_detect: true
  };

  // 4. 雪（ゆっくり降る）
  const presetSnow = {
    particles: {
      number: { value: 180, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.95, random: true },
      size: { value: 4.5, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1, direction: "bottom", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: false }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { push: { particles_nb: 4 } }
    },
    retina_detect: true
  };

  // 5. 花火風（カラフルな粒子がクリックで弾ける）
  const presetFireworks = {
    particles: {
      number: { value: 120, density: { enable: true, value_area: 800 } },
      color: { value: ["#ff5252", "#ffd76a", "#7fd8ff", "#4f7cff", "#ff9de2"] },
      shape: { type: "star" },
      opacity: { value: 0.95, random: true },
      size: { value: 6, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1.8, direction: "none", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { repulse: { distance: 80 }, push: { particles_nb: 6 } }
    },
    retina_detect: true
  };

  // 6. 花吹雪（桜色のふわふわした粒子）
  const presetSakura = {
    particles: {
      number: { value: 130, density: { enable: true, value_area: 800 } },
      color: { value: ["#ffb7c5", "#ffd9e2", "#ff8fa3"] },
      shape: { type: "circle" },
      opacity: { value: 0.95, random: true },
      size: { value: 7.5, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1.2, direction: "bottom", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { bubble: { distance: 150, size: 8, duration: 2, opacity: 0.8 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
  };

  // 7. オーロラ（多色の粒子がゆっくり漂い、うっすら線で繋がる）
  const presetAurora = {
    particles: {
      number: { value: 100, density: { enable: true, value_area: 800 } },
      color: { value: ["#7fffd4", "#7fd8ff", "#c77fff", "#4f7cff"] },
      shape: { type: "circle" },
      opacity: { value: 0.8, random: true },
      size: { value: 6, random: true },
      line_linked: { enable: true, distance: 180, color: "#7fffd4", opacity: 0.4, width: 1.5 },
      move: { enable: true, speed: 0.6, direction: "none", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false }, resize: true },
      modes: { grab: { distance: 160, line_linked: { opacity: 0.5 } } }
    },
    retina_detect: true
  };

  // 8. デジタルレイン（緑の粒子が縦に流れる、マトリックス風）
  const presetDigitalRain = {
    particles: {
      number: { value: 160, density: { enable: true, value_area: 800 } },
      color: { value: "#39ff88" },
      shape: { type: "edge" },
      opacity: { value: 0.8, random: true },
      size: { value: 4.5, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 4, direction: "bottom", random: false, straight: true, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { repulse: { distance: 60 }, push: { particles_nb: 5 } }
    },
    retina_detect: true
  };

  // 9. 幾何学模様（回転する多角形が漂う）
  const presetGeometric = {
    particles: {
      number: { value: 90, density: { enable: true, value_area: 800 } },
      color: { value: ["#ffd76a", "#7fd8ff", "#ff9de2"] },
      shape: { type: "polygon", polygon: { nb_sides: 6 } },
      opacity: { value: 0.8, random: true },
      size: { value: 9, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { bubble: { distance: 130, size: 10, duration: 2, opacity: 0.7 }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  };

  // 10. コンフェッティ（お祝い感のあるカラフルな紙吹雪）
  const presetConfetti = {
    particles: {
      number: { value: 150, density: { enable: true, value_area: 800 } },
      color: { value: ["#ff5252", "#ffd76a", "#7fd8ff", "#4f7cff", "#39ff88", "#ff9de2"] },
      shape: { type: "triangle" },
      opacity: { value: 0.95, random: true },
      size: { value: 6, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 2.5, direction: "bottom", random: true, straight: false, out_mode: "out" }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { repulse: { distance: 100 }, push: { particles_nb: 6 } }
    },
    retina_detect: true
  };

  /* ---------- プリセット一覧（増やしたい場合はここに push） ---------- */
  const presets = [
    presetNetwork, presetStars, presetBubbles, presetSnow, presetFireworks,
    presetSakura, presetAurora, presetDigitalRain, presetGeometric, presetConfetti
  ];

  const presetNames = [
    "ネットワーク", "星空", "泡", "雪", "花火風",
    "花吹雪", "オーロラ", "デジタルレイン", "幾何学模様", "コンフェッティ"
  ];

  /* ---------- 指定したプリセットを適用する（確認・切替用） ---------- */
  function applyPreset(index) {
    if (window.pJSDom && window.pJSDom.length) {
      window.pJSDom.forEach(function (dom) {
        if (dom.pJS && dom.pJS.fn && dom.pJS.fn.vendors) {
          dom.pJS.fn.vendors.destroypJS();
        }
      });
      window.pJSDom = [];
    }
    particlesJS("particles-js", presets[index]);
  }

  /* ---------- 週番号で自動選択 ---------- */
  const weekNumber = getISOWeekNumber(new Date());
  const currentIndex = weekNumber % presets.length;

  /* ---------- particles.js を起動 ---------- */
  if (window.particlesJS) {
    applyPreset(currentIndex);
  }

  /* ---------- 確認・デバッグ用に外部公開（プレビューページで使用） ---------- */
  window.bgRotator = {
    presets: presets,
    presetNames: presetNames,
    weekNumber: weekNumber,
    currentIndex: currentIndex,
    apply: applyPreset
  };

})();
