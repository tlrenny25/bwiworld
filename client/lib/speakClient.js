(function (window, undefined) {
  var document = window.document;

  var speak = {};

  var _speak = window.speak;

  speak.noConflict = function () {
    window.speak = _speak;
    return speak;
  };

  var aliasedAudioContext = window.AudioContext || window.webkitAudioContext;

  var isChrome = (
    (typeof navigator !== 'undefined') &&
    navigator.userAgent &&
    navigator.userAgent.indexOf('Chrome') !== -1
  );

  var chromeVersion = (isChrome)
    ? parseInt(
        navigator.userAgent.replace(/^.*?\bChrome\/([0-9]+).*$/, '$1'),
        10
      )
    : 0;

  var audioContext = new aliasedAudioContext();

  var speakWorker;

  try {
    // https://github.com/yoshi6jp/speak.js/commit/b85d385024f1e20818aa9e3b272c86aa9fc2ebe6
    speakWorker = new Worker(
      document
        .querySelector('script[src$="speakClient.js"]')
        .getAttribute('src')
        .replace(/speakClient.js$/, 'speakWorker.js')
    );
  } catch (e) {
    console.log('speak.js warning: no worker support');
  }

  speak.play = function (text, self, args, onended, onstart) {

    const replacements = {
      "idk": "I don't know",
      "idc": "I don't care",
      "ts": "this shit",
	  "pmo": "piss me off",
	  "stfu": "shut the fuck up",
	  "ooo": "out of office",
	  "idgaf": "i don't give a fuck",
	  "idfk": "i don't fucking know",
	  "idfc": "i don't fucking care",
	  "wtf": "what the fuck",
	  "wth": "what the heck",
	  "ik": "i know",
	  "jk": "just kidding",
	  "yk": "you know",
	  "bw": "BonziWORLD",
    };

    text = text.replace(/\b[a-z]+\b/gi, function (word) {
      const lower = word.toLowerCase();
      return replacements[lower] || word;
    });

    if (window.tts[self] != undefined && window.tts[self].started) {
      window.tts[self].stop();
    } else if (window.tts[self] != undefined) {
      window.tts[self].start = function () {};
      window.tts[self].started = false;
    }

    var source = audioContext.createBufferSource();

    window.tts[self] = source;

    source.stopOld = source.stop;

    source.stop = function () {
      this.stopOld();

      if (this.endTimeout) {
        clearTimeout(this.endTimeout);
      }
    };

    var PROFILE = 1;

    function startSource(source) {
      if (source.start) {
        source.started = true;
        source.start(0);
      } else {
        source.noteOn(0);
      }

      if (onstart) {
        onstart(source);
      }
    }

    function playSound(streamBuffer) {
      source.connect(audioContext.destination);

      audioContext.decodeAudioData(
        streamBuffer,

        function (audioData) {


          if (!isChrome && source.onended !== undefined) {

            source.onended = function () {
              source.stop();

              if (onended) {
                onended();
              }
            };

          } else {

            var duration = audioData.duration;


            var delay = (duration)
              ? Math.ceil(duration * 1000)
              : 1000;

            source.endTimeout = setTimeout(function () {
              if (onended) {
                onended();
              }
            }, delay);
          }

          source.buffer = audioData;


          if (chromeVersion >= 32) {
            startSource(source);
          }
        },

        function (error) {
          // decoding-error-callback
          console.error(error);
        }
      );


      if (!isChrome || chromeVersion < 32) {
        startSource(source);
      }
    }

    function handleWav(wav) {
      var startTime = Date.now();

      var buffer = new ArrayBuffer(wav.length);

      new Uint8Array(buffer).set(wav);

      // TODO: try playAudioDataAPI(data), and fallback if failed
      playSound(buffer);
    }

    if (args && args.noWorker) {

      // Do everything right now. speakGenerator.js must have been loaded.

      var startTime = Date.now();

      var wav = generateSpeech(text, args);

      playSound(wav);

    } else {

      // Call the worker, which will return a wav that we then play

      var startTime = Date.now();

      speakWorker.onmessage = function (event) {
        handleWav(event.data);
      };

      speakWorker.postMessage({
        text: text,
        args: args
      });
    }
  };

  // Expose speak to the global object
  window.speak = speak;

})(window);