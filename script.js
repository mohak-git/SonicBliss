require("dotenv").config();
document.addEventListener("DOMContentLoaded", () => {
  let songtracks;
  let token;
  let clientId;
  let clientSecret;
  let progressBarIntervalId;

  const authBtn = document.querySelector(".authButton");
  const authCont = document.querySelector(".authContainer");
  const searchCont = document.querySelector(".searchContainer");

  authBtn.addEventListener("click", async () => {
    authBtn.innerText = `Authenticating...`;

    clientId = process.env.CLIENT_ID;
    clientSecret = process.env.CLIENT_SECRET;

    async function getToken() {
      const tokenUrl = "https://accounts.spotify.com/api/token";
      const tokenOption = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      };

      const tokenResponse = await fetch(tokenUrl, tokenOption);
      const tokenData = await tokenResponse.json();
      token = tokenData.access_token;
    }
    await getToken();
    const disableAuthButton = () => {
      authBtn.innerText = "Authenticated!";
      authCont.style.width = "13%";
      authCont.style.transition = "1s 0s";
      authBtn.disabled = true;
      authBtn.style.color = "lightgreen";
    };
    disableAuthButton();
    searchCont.style.display = "flex";
  });

  const startBtn = document.querySelector(".startButton");
  const songTitle = document.querySelector(".songTitle");
  const singer = document.querySelector(".singer");
  const songPoster = document.querySelector(".songPoster");
  const startTime = document.querySelector(".startTime");
  const endTime = document.querySelector(".endTime");
  const progressBar = document.querySelector(".progressBar");
  const song = document.querySelector(".song");
  const playBtn = document.querySelector(".playButton");
  const pauseBtn = document.querySelector(".pauseButton");
  const nextBtn = document.querySelector(".nextButton");
  let playImg = document.querySelector(".playButtonImage");
  let pauseImg = document.querySelector(".pauseButtonImage");

  let playSong = async function () {
    if (!startBtn.disabled) startBtn.disabled = true;
    let num = Math.floor(Math.random() * songtracks.length);
    const trackDetails = songtracks[num];

    let posterImage;

    songTitle.innerText = trackDetails.track.name.split("(")[0];
    singer.innerText = trackDetails.track.artists[0].name;

    async function getPoster() {
      const posterUrl = `https://google-search-json.p.rapidapi.com/search/image?q=${trackDetails.name}&num=1`;
      const posterOptions = {
        headers: {
          "x-rapidapi-key":
            "ef8e72a838msh1e5274c1bc90f89p141f63jsn1bab8d311445",
        },
      };

      const posterResponse = await fetch(posterUrl, posterOptions);
      const posterData = await posterResponse.json();

      try {
        posterImage = posterData.items[0].originalImageUrl;
      } catch (e) {
        posterImage =
          "https://plus.unsplash.com/premium_photo-1682125488670-29e72e5a7672?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      }
    }
    await getPoster();

    songPoster.src = posterImage;

    const durationInMin = trackDetails.track.duration_ms / 1000;
    const totalMin = Math.floor(durationInMin / 60);
    const totalSec = Math.floor((durationInMin / 60 - totalMin) * 60);
    Math.floor(totalSec / 10) == 0
      ? (endTime.innerText = `${totalMin}:0${totalSec}`)
      : (endTime.innerText = `${totalMin}:${totalSec}`);

    startTime.innerText = "0:00";
    let progressTimer = 1;
    function progressBarMovement() {
      if (
        progressTimer === 1 ||
        (playBtn.disabled && progressTimer < durationInMin)
      ) {
        let percent = (progressTimer / durationInMin) * 100;
        progressBar.style.setProperty("--percent", `${percent}%`);

        let secVar =
          Math.floor((progressTimer % 60) / 10) != 0
            ? Math.floor(progressTimer % 60)
            : "0" + Math.floor(progressTimer % 60);
        startTime.innerText = `${Math.floor(progressTimer / 60)}:${secVar}`;

        progressTimer++;
      }
    }
    progressBarIntervalId = setInterval(progressBarMovement, 1000);

    const songUrl = trackDetails.track.preview_url;
    song.src = songUrl;

    let autoplay = function () {
      playBtn.disabled = true;
      playImg.style.opacity = "0.1";
      pauseBtn.disabled = false;
      pauseImg.style.opacity = "1";
      song.play();
      songPoster.style.animation = `rotate 5s linear infinite, bgBounce 0.5s cubic-bezier(0.95, 0.05, 0.795, 0.035) 0s infinite alternate both`;
    };
    autoplay();

    playBtn.addEventListener("click", autoplay);
    pauseBtn.addEventListener("click", () => {
      pauseBtn.disabled = true;
      pauseImg.style.opacity = "0.1";
      playBtn.disabled = false;
      playImg.style.opacity = "1";
      song.pause();
      songPoster.style.animation = `rotate 5s linear infinite`;
    });
  };
  let stopSong = function () {
    song.pause();
    clearInterval(progressBarIntervalId);
    progressBar.style.setProperty("--percent", "0%");
    startTime.innerText = "0:00";
    playBtn.disabled = false;
    playImg.style.opacity = "1";
    pauseBtn.disabled = true;
    pauseImg.style.opacity = "0.1";
    songPoster.style.animation = "";
  };

  startBtn.addEventListener("click", async () => {
    const playlistId = document.querySelector(".searchPlaylist").value;

    async function getTracks() {
      const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;

      const playlistOption = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const playlistResponse = await fetch(playlistUrl, playlistOption);
      const playlistData = await playlistResponse.json();
      songtracks = [...playlistData.tracks.items];
    }
    await getTracks();
    document.querySelector(".songCardContainer").style.display = "flex";

    playSong();
  });

  nextBtn.addEventListener("click", () => {
    stopSong();
    playSong();
  });
});
