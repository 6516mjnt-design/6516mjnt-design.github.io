/* ============================================================
   bgm-rotator.js
   ISO週番号に応じてBGMを自動選択・自動再生を試みる。
   ブラウザの自動再生ブロックに引っかかった場合は、
   画面右下の小さなボタンをユーザーが押すことで再生を開始する。
   ============================================================ */

(function () {

  /* ---------- ISO週番号を計算する（background-rotator.jsと同じロジック） ---------- */
  function getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /* ---------- 曲リスト（増やしたい場合はここに追加。ファイルは audio/ フォルダに置く） ---------- */
  const tracks = [
    "audio/bgm1.mp3",
    "audio/bgm2.mp3",
    "audio/bgm3.mp3",
    "audio/bgm4.mp3",
    "audio/bgm5.mp3"
  ];

  const weekNumber = getISOWeekNumber(new Date());
  const selectedTrack = tracks[weekNumber % tracks.length];

  const audio = document.getElementById("bgm-player");
  const btn = document.getElementById("bgm-toggle");
  if (!audio) return;

  audio.src = selectedTrack;
  audio.loop = true;
  audio.volume = 0.4; // 控えめな音量

  function setButtonState(isPlaying) {
    if (!btn) return;
    btn.textContent = isPlaying ? "\uD83D\uDD0A" : "\uD83D\uDD08"; // 🔊 or 🔈
    btn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    btn.classList.toggle("bgm-needs-tap", !isPlaying);
  }

  function tryAutoplay() {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(function () { setButtonState(true); })
        .catch(function () {
          // 自動再生がブロックされた場合はボタンで手動再生を促す
          setButtonState(false);
        });
    }
  }

  /* ---------- 指定した曲を再生する（確認・切替用） ---------- */
  function playTrack(index) {
    audio.src = tracks[index];
    audio.currentTime = 0;
    audio.play().then(function () { setButtonState(true); });
  }

  if (btn) {
    btn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function () { setButtonState(true); });
      } else {
        audio.pause();
        setButtonState(false);
      }
    });
  }

  window.addEventListener("load", tryAutoplay);

  /* ---------- 確認・デバッグ用に外部公開 ---------- */
  window.bgmRotator = {
    tracks: tracks,
    weekNumber: weekNumber,
    selectedTrack: selectedTrack,
    audio: audio,
    playTrack: playTrack
  };

})();
