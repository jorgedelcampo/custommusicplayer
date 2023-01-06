let audio = false;
let songs = [];
let item = false;
let caption = '';

let skin = {
    "cassette" : "<div class=\"cassette\"><div class=\"wheel_container\"><img src=\"assets/svg/reel.svg\" class=\"wheel wheel_left\"><div class=\"reel_container\"><div class=\"reel reel_left\"></div><div class=\"reel reel_right\"></div></div><img src=\"assets/svg/reel.svg\" class=\"wheel wheel_right\"></div></div>",
    
    "vinyl" : "<div class=\"vinyl\"></div>"
}

let skinIndex = 0;


let player = {
    init: function() {
        player.lockOrientation();
        //player.mediaControls();
        player.loadSongs();
        player.toggleSkin();
    },

    lockOrientation: function() {
        //screen.orientation.lock('portrait');
    },

    mediaControls: function(){
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: caption,
                /*artwork: [{
                    src: 'assets/img/icon.svg',
                    sizes: '96x96',
                    type: 'image/svg'
                }]*/
            });

            navigator.mediaSession.setActionHandler('play', () => { player.play();  });
            navigator.mediaSession.setActionHandler('pause', () => { player.pause(); });
            navigator.mediaSession.setActionHandler('previoustrack', () => { player.back(); });
            navigator.mediaSession.setActionHandler('nexttrack', () => { player.next(); });

            function updateMediaSessionState(){
                navigator.mediaSession.playbackState = audio.paused ? "paused" : "playing";
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate,
                    position: audio.currentTime,
                });
            }
            if("mediasession" in navigator){
                const events = ['playing', 'paused', 'durationchange', 'ratechange', 'timechange'];
                //for(const event of events)
                    //audio.addEventListener(event, updateMediaSessionState);
            }

            }
    },

    toggleSkin: function() {
        const toggleSkin = document.getElementById('toggle-skin');
        let playerEl = document.getElementById('player');
        let playerCont = document.getElementById('player_container');
        let songCaption = document.getElementById('song_caption');
        let skins = [];
        for (let x in skin) {
            skins.push(x);
        }
        playerEl.innerHTML = skin[skins[0]];
        playerCont.classList.add(skins[0]);
        toggleSkin.addEventListener('click', function(){
            playerEl.classList.add('animated');
            songCaption.classList.add('animated');
            skinIndex++;
            if(skinIndex > skins.length-1){
                skinIndex = 0;
            }
            toggleSkin.classList.add('toggle_animated');
            toggleSkin.addEventListener('animationend', () => {
                toggleSkin.classList.remove('toggle_animated');
                playerEl.classList.remove('animated');
                songCaption.classList.remove('animated');
            });
            playerEl.innerHTML = skin[skins[skinIndex]];
            playerCont.removeAttribute('class');
            playerCont.classList.add(skins[skinIndex]);
            player.captionSong(caption);
        });
    },

    loadSongs: function(){
        let selectSong = document.getElementById('selectSong');
        selectSong.addEventListener('change', function(e){
            const files = e.target.files;
            for (const file of files) {
                songs.push({'url': URL.createObjectURL(file), 'name': file.name});
            } // end for
            if(songs.length > 0 && !audio){
                player.selectSong(0);
            }
        }); // enf addEventListener
    },

    showList: function() {
        let prompt = document.getElementById('aside_prompt');
        let promptCon = document.querySelector('#aside_prompt .content_prompt');
        prompt.classList.add('prompt_active');
        promptCon.innerHTML = '<p class="promp_title">Playlist</p>';
        let listSongs = '';
        for(let i = 0 ; i < songs.length; i++){
            listSongs += '<li onclick="player.selectSong(' + i + ')">' + songs[i].name + '</li>';
        } // end for
        promptCon.innerHTML += '<ul>' + listSongs + '</ul>';
        promptCon.innerHTML += '<label for="selectSong"><img src="assets/svg/add.svg"></label>';
        promptCon.innerHTML += '<div id="close_prompt">x</div>';
        let closePrompt = document.getElementById('close_prompt');
        closePrompt.addEventListener('click', function(){
            let prompt = document.getElementById('aside_prompt');
            prompt.classList.remove('prompt_active');
        });
    },

    selectSong: function(i) {
        let prompt = document.getElementById('aside_prompt');
        prompt.classList.remove('prompt_active');
        item = i;
        caption = songs[i].name;
        audio = new Audio(songs[i].url);
        player.captionSong(caption);
        let transport = document.querySelector('.transport');
        transport.classList.add('ready');
        let totalTime = document.querySelector('.transport .total_time');
        audio.onloadedmetadata = function() {
            let m = Math.floor(audio.duration / 60);
            let s = Math.round(audio.duration % 60);
            totalTime.innerHTML = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        };
        let currentTime = document.querySelector('.transport .current_time');
        currentTime.innerHTML = "00:00";
        player.mediaControls();
    },

    captionSong: function(i) {
        let caption = document.querySelector('#song_caption marquee');
        caption.innerHTML = i;
    },

    seeker: function(e) {
        audio.currentTime = e.value / 100 * audio.duration;
    },

    duration: function() {
        audio.addEventListener('timeupdate', () => {
            const percent = audio.currentTime / audio.duration * 100;
            const seeker = document.getElementById("seeker");
            seeker.value = percent;
            let currentTime = document.querySelector('.transport .current_time');
            let m = Math.floor(audio.currentTime / 60);
            let s = Math.round(audio.currentTime % 60);
            currentTime.innerHTML = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
          });
    },

    play: function() {
        if(!audio) {
            alert('Debes seleccionar una canción');
        }
        else {
            if(audio.paused){
                audio.play();
                let playerEl = document.getElementById('player');
                playerEl.classList.remove('paused');
                let on = document.querySelectorAll('.transport .on');
                on.forEach(e => e.classList.remove('on'));
                const play = document.querySelector('.transport .play');
                player.duration();
                playerEl.classList.add('on');
                play.firstElementChild.setAttribute('src', 'assets/svg/media-control-pause.svg');
                player.moveWheel();
                player.endSong();
            }
            else {
                player.pause();
            }
        }
    },

    pause: function() {
        audio.pause();
        let playerEl = document.getElementById('player');
        playerEl.classList.add('paused');
        let on = document.querySelectorAll('.transport .on');
        on.forEach(e => e.classList.remove('on'));
        let play = document.querySelector('.transport .play');
        //playerEl.classList.remove('on');
        play.firstElementChild.setAttribute('src', 'assets/svg/media-control-play.svg');
        player.stopWheel();
    },

    stop: function() {
        audio.pause();
        audio.currentTime = 0;
        let caption = document.querySelectorAll('#song_caption marquee');
        caption[0].innerHTML = '';
        let on = document.querySelectorAll('.transport .on');
        on.forEach(e => e.classList.remove('on'));
        player.stopWheel();
    },

    back: function() {
        player.stop();
        item--;
        if(item < 0) {
            item = songs.length - 1;
        }
        player.selectSong(item)
        player.play();
    },

    next: function() {
        player.stop();
        item++;
        if(item >= songs.length){
            item = 0;
        }
        player.selectSong(item)
        player.play();
    },

    endSong: function() {
        if(audio){
            audio.addEventListener('ended', function(){
                audio.currentTime = 0;
                player.next();
            });
        }
    },

    moveWheel: function() {
        let wheel = document.querySelectorAll('.cassette_container .wheel');
        wheel.forEach(e => e.classList.add('on'));
        wheel.forEach(e => e.style.animationPlayState = 'running');
    },

    stopWheel: function() {
        let wheel = document.querySelectorAll('.cassette_container .wheel');
        wheel.forEach(e => e.style.animationPlayState = 'paused');
    },

}
document.addEventListener('DOMContentLoaded', player.init);