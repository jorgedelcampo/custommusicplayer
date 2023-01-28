let testing = true; // toggle true for testing

let audio = false;
let songs = [];
let item = false;
let caption = '';
let autoplay = false;

let skinIndex = 0;

let canvas = false;
let ctx = false;
let WIDTH = 0;
let HEIGHT = 0;

let player = {
    init: function() {
        player.initCanvas();
        player.loadSongs();
        player.toggleSkin();
        player.initGestures();
        player.pwa();
    },
    
    pwa: function(){
        if (navigator.serviceWorker.controller) {
        console.log("Active service worker found");
        } else {
            navigator.serviceWorker
            .register("serviceWorker.js", {
            scope: "./"
            })
            .then(function(reg) {
            console.log("Service worker registered");
            });
        }
    },

    initCanvas: function() {
        canvas = document.querySelector("canvas");
        ctx = canvas.getContext("2d");
        canvas.width = innerWidth * 0.8;
        canvas.height = innerWidth * 0.5625; // 16:9
        WIDTH = canvas.width;
        HEIGHT = canvas.height;

        window.addEventListener('resize', function(){
            canvas.width = innerWidth * 0.8;
            canvas.height = innerWidth * 0.5625; // 16:9
            WIDTH = canvas.width;
            HEIGHT = canvas.height;
        });
    },

    initGestures: function(){
        let prompt = document.getElementById('aside_prompt');
        prompt.addEventListener('touchstart', handleTouchStart, false);        
        prompt.addEventListener('touchmove', handleTouchMove, false);

        var xDown = null;                                                        
        var yDown = null;

        function getTouches(evt) {
        return evt.touches ||             // browser API
                evt.originalEvent.touches; // jQuery
        }                                                     
                                                                                
        function handleTouchStart(evt) {
            const firstTouch = getTouches(evt)[0];                                      
            xDown = firstTouch.clientX;
            yDown = firstTouch.clientY;
        };                                                
                                                                                
        function handleTouchMove(evt) {
            if ( ! xDown || ! yDown ) {
                return;
            }

            let xUp = evt.touches[0].clientX;                                    
            let yUp = evt.touches[0].clientY;

            let xDiff = xDown - xUp;
            let yDiff = yDown - yUp;
                                                                                
            if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                if ( xDiff < 0 ) {
                    /* right swipe */ 
                } else {
                    /* left swipe */
                    prompt.classList.remove('prompt_active');
                    autoplay = false;
                }                       
            } else {
                if ( yDiff < 0 ) {
                    /* down swipe */ 
                } else { 
                    /* up swipe */
                }                                                                 
            }
            /* reset values */
            xDown = null;
            yDown = null;                                             
        };
    },

    createMediaControls: function(){
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: caption,
            artwork: [
              { src: 'assets/img/icon.png', sizes: '512x512', type: 'image/png' },
            ]
          });

          navigator.mediaSession.setActionHandler('play', () => { player.play(); });
          navigator.mediaSession.setActionHandler('pause', () => { player.pause(); });
          navigator.mediaSession.setActionHandler('stop', () => { player.stop(); });
          navigator.mediaSession.setActionHandler('seekbackward', () => { player.seeker(); });
          navigator.mediaSession.setActionHandler('seekforward', () => { player.seeker(); });
          navigator.mediaSession.setActionHandler('seekto', () => { /* Code excerpted. */ });
          navigator.mediaSession.setActionHandler('previoustrack', () => { player.back(); });
          navigator.mediaSession.setActionHandler('nexttrack', () => { player.next(); });
          //navigator.mediaSession.setActionHandler('skipad', () => { /* Code excerpted. */ });
          //navigator.mediaSession.setActionHandler('togglecamera', () => { /* Code excerpted. */ });
          //navigator.mediaSession.setActionHandler('togglemicrophone', () => { /* Code excerpted. */ });
          //navigator.mediaSession.setActionHandler('hangup', () => { /* Code excerpted. */ });

        }
        
        if(testing){
            return;
        }

        MusicControls.create({
            track       : caption,  // optional, default : ''
            cover       : 'assets/img/icon.png', // optional, default : nothing
            isPlaying   : true, // optional, default : true
            dismissable : true, // optional, default : false
        
            // hide previous/next/close buttons:
            hasPrev     : true,		// show previous button, optional, default: true
            hasNext     : true,		// show next button, optional, default: true
            hasClose    : true,		// show close button, optional, default: false
        
            // Android only, optional
            // text displayed in the status bar when the notification (and the ticker) are updated
            ticker      : caption,
            //All icons default to their built-in android equivalents
            //The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
            playIcon: 'media_play',
            pauseIcon: 'media_pause',
            prevIcon: 'media_prev',
            nextIcon: 'media_next',
            closeIcon: 'media_close',
            notificationIcon: 'notification'
        }, onSuccess, onError);

        function onSuccess(){
            //console.log('onSuccess');
        }

        function onError(err){
            console.log('Error: ' + err);
        }
    },

    listenMediaControls: function(){
        
        const actionHandlers = [
          // play
          [
            'play',
            async () => {
              // play our audio
              await player.play();
              // set playback state
              navigator.mediaSession.playbackState = "playing";
              // update our status element
              updateStatus(allMeta[index], 'Action: play  |  Track is playing…')
            }
          ],
          [
            'pause',
            () => {
              // pause out audio
              player.pause();
              // set playback state
              navigator.mediaSession.playbackState = "paused";
              // update our status element
              updateStatus(allMeta[index], 'Action: pause  |  Track has been paused…');
            }
          ],
        ]

        for (const [action, handler] of actionHandlers) {
          try {
            navigator.mediaSession.setActionHandler(action, handler);
          } catch (error) {
            console.log(`The media session action "${action}" is not supported yet.`);
          }
        }
        
        if(testing){
            return;
        }
        function events(action) {

            const message = JSON.parse(action).message;
            switch(message) {
                case 'music-controls-next':
                    player.next();
                    break;
                case 'music-controls-previous':
                    player.back();
                    break;
                case 'music-controls-pause':                    
                    player.updateMediaControls(false); // toggle pause notification
                    player.play();
                    break;
                case 'music-controls-play':
                    player.updateMediaControls(true); // toggle play notification
                    player.play();
                    break;
                case 'music-controls-media-button-pause':
                    player.play();
                    break;
                case 'music-controls-media-button-play':
                    player.play();
                    break;
                case 'music-controls-media-button-play-pause':
                    player.play();
                    break;
                case 'music-controls-destroy':
                    MusicControls.destroy();
                    break;
            }
        }

        // Register callback
        MusicControls.subscribe(events);

        MusicControls.listen();
    },

    updateMediaControls: function(value){
        if(testing){
            return;
        }
        MusicControls.updateIsPlaying(value);
        MusicControls.updateDismissable(true);
    },

    toggleSkin: function() {
        const toggleSkin = document.getElementById('toggle-skin');
        let canvas = document.querySelector('canvas');
        skinIndex++;
        if(skinIndex >= 4){
            skinIndex = 0;
        }
        if(!audio){
            skinIndex = 1;
        }
        if(skinIndex === 3 && audio){
            canvas.style.filter = 'none';
        }
        else {
            canvas.style.filter = 'drop-shadow(2px 2px 0px var(--color-1)) drop-shadow(-2px -2px 0px var(--color-2))';
        }
        toggleSkin.addEventListener('click', function(){
            canvas.classList.add('animated');
            toggleSkin.classList.add('toggle_animated');
            toggleSkin.addEventListener('animationend', () => {
                toggleSkin.classList.remove('toggle_animated');
                canvas.classList.remove('animated');
            });
        });
    },

    audioCanvas: function() {
        if(audio){

            // 1. Definir los elementos y los eventos
            canvas.classList.remove('await');

            // 3. Crear la animación con canvas
            const drawAudio = (analyser) => {
    
    
            if(skinIndex === 0){ // cassette
                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                
                // cassette
                let img = new Image();
                img.src = "assets/img/cassette.svg";
                let ratioImg = img.width / img.height;
                let deltaHeight = HEIGHT - (WIDTH / ratioImg);
                const widthCassette = WIDTH * 0.9;
                ctx.drawImage(img, WIDTH * 0.05, deltaHeight / 2, widthCassette, widthCassette / ratioImg);
                
                // nombre canción
                ctx.font = Math.round(WIDTH * 0.036) + 'px Permanent Marker';
                ctx.fillStyle = '#fafafa';
                ctx.textAlign = 'center';
                ctx.fillText(caption.slice(0,28), WIDTH / 2, 0.33 * (widthCassette / ratioImg));
                
                // rueda dentada left
                ctx.save();
                    img = new Image();
                    img.src = "assets/svg/reel.svg";
                    const wheelSize = widthCassette * 0.12;
                    ctx.translate(0.25 * WIDTH + wheelSize / 2, 0.46 * (widthCassette / ratioImg) + wheelSize / 2);
                    ctx.rotate(audio.currentTime);
                    ctx.drawImage(img, -wheelSize / 2, -wheelSize / 2, wheelSize, wheelSize);
                ctx.restore();
                
                // rueda dentada right
                ctx.save();
                    img = new Image();
                    img.src = "assets/svg/reel.svg";
                    ctx.translate((0.75 * WIDTH) - (WIDTH * 0.12) + wheelSize / 2, 0.46 * (widthCassette / ratioImg) + wheelSize / 2);
                    ctx.rotate(audio.currentTime);
                    ctx.drawImage(img, -wheelSize / 2, -wheelSize / 2, wheelSize, wheelSize);
                ctx.restore();

            }

            // vinyl
            if (skinIndex === 1){
                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                ctx.save();
                    let img = new Image();
                    img.src = "assets/img/vinyl.svg";
                    ctx.translate(WIDTH / 2, HEIGHT / 2);
                    ctx.rotate(audio.currentTime);
                    ctx.drawImage(img, -HEIGHT / 2, -HEIGHT / 2, HEIGHT, HEIGHT);
                ctx.restore();
            }

            // speaker
            if (skinIndex === 2){
                const img = new Image();
                img.src = 'assets/img/loadspeaker.png';
                ctx.clearRect(0, 0, WIDTH, HEIGHT);

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                const barWidth = (WIDTH / bufferLength) * 3;
                let x = 0;
                analyser.getByteFrequencyData(dataArray);

                // all the magic    
                dataArray.forEach((decibel, index) => {
                    if(index == 0){
                        const redond = Math.round(decibel * 100) / 100;
                        const calcSize = HEIGHT*0.75 + 25*(redond/HEIGHT);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, (WIDTH - calcSize) / 2, (HEIGHT - calcSize) / 2, calcSize, calcSize);
                    }
                    x += barWidth + 1;
                });
            } // end skinIndex === 2 
            
            // spectrum
            if (skinIndex === 3){
                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                const barWidth = (WIDTH / bufferLength) * 3;
                let x = 0;
                analyser.getByteFrequencyData(dataArray);

                // all the magic    
                dataArray.forEach((decibel) => {
                    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                    gradient.addColorStop(0, "#B3048A");
                    gradient.addColorStop(1, "#21B300");
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, HEIGHT * 1.36 - decibel, barWidth, decibel);
                    x += barWidth + 1;
                });
            } // end skinIndex === 3

        requestAnimationFrame(() => drawAudio(analyser));
        
        } // end drawAudio()

        // 2. Crear el analyser y la data necesaria
            const initAnalyser = async (audio) => {
        
            // all the setup
            const context = new AudioContext();
            const src = context.createMediaElementSource(audio);
            const analyser = context.createAnalyser();
            src.connect(analyser);
            analyser.connect(context.destination);
            analyser.fftSize = 256;
            return analyser;
            };
        
            const onChange = async (event) => {
            const analyser = await initAnalyser(audio);

            // dibujar
            drawAudio(analyser);
            };

            // listener
            audio.onplay = onChange();
        }
    },

    loadSongs: function(){
        let selectSong = document.getElementById('selectSong');
        selectSong.addEventListener('change', function(e){
            const files = e.target.files;
            const objects = [];
            for (const file of files) {
                songs.push({'url': URL.createObjectURL(file), 'name': file.name});
            } // end for
            
            let promptCon = document.querySelector('#aside_prompt .content_prompt');
            promptCon.innerHTML = '<p class="promp_title">Playlist</p>';
            let listSongs = '';
            for(let i = 0 ; i < songs.length; i++){
                listSongs += '<li onclick="player.selectSong(' + i + ')">' + songs[i].name + '</li>';
            } // end for
            promptCon.innerHTML += '<ul>' + listSongs + '</ul>';
            promptCon.innerHTML += '<label for="selectSong"><img src="assets/svg/add.svg"></label>';
            promptCon.innerHTML += '<div id="close_prompt">x</div>';
            
            if(songs.length > 0 && !audio){
                player.selectSong(0);
                player.audioCanvas();
            }
        }); // enf addEventListener
    },

    showList: function() {
        let prompt = document.getElementById('aside_prompt');
        prompt.classList.add('prompt_active');
        autoplay = true;
        let closePrompt = document.getElementById('close_prompt');
        closePrompt.addEventListener('click', function(){
            let prompt = document.getElementById('aside_prompt');
            prompt.classList.remove('prompt_active');
            autoplay = false;
        });
    },

    selectSong: function(i) {
        let prompt = document.getElementById('aside_prompt');
        prompt.classList.remove('prompt_active');
        item = i;
        caption = songs[i].name;
        if(!audio){
            audio = new Audio(songs[i].url);
        }
        audio.src = songs[i].url;
        if(autoplay){
            audio.play();
            autoplay = false;
            const play = document.querySelector('.transport .play');
            play.firstElementChild.setAttribute('src', 'assets/svg/media-control-pause.svg');
        }
        player.captionSong(caption);
        let transport = document.querySelector('.transport');
        transport.classList.add('ready');
        let totalTime = document.querySelector('.transport .total_time');
        audio.onloadedmetadata = function() {
            let m = Math.floor(audio.duration / 60);
            let s = Math.round(audio.duration % 60);
            totalTime.innerHTML = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        };
        audio.title = caption;
        let currentTime = document.querySelector('.transport .current_time');
        currentTime.innerHTML = "00:00";
        player.createMediaControls();
        //player.audioCanvas();
        //player.toggleSkin();
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
        audio.play();
        let on = document.querySelectorAll('.transport .on');
        on.forEach(e => e.classList.remove('on'));
        player.duration();
        player.moveWheel();
        player.endSong();
        player.updateMediaControls(true);
        player.listenMediaControls();
    },

    pause: function() {
        audio.pause();
        let on = document.querySelectorAll('.transport .on');
        on.forEach(e => e.classList.remove('on'));
        let play = document.querySelector('.transport .play');
        play.firstElementChild.setAttribute('src', 'assets/svg/media-control-play.svg');
        player.stopWheel();
        player.updateMediaControls(false);
        player.listenMediaControls();
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

    togglePlayPause: function(){
        if(!audio) {
            alert('Debes seleccionar una canción');
        }
        else {
            if(audio.paused){
                audio.setAttribute('title', caption);
                audio.setAttribute('controls', true);
                audio.setAttribute('controlslist', true);
                audio.play();
                const play = document.querySelector('.transport .play');
                play.firstElementChild.setAttribute('src', 'assets/svg/media-control-pause.svg');
            }
            else {
                player.pause();
            }
        }
    },

}
document.addEventListener('DOMContentLoaded', player.init, false);
