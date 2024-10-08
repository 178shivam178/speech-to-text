var phraseDiv;
var startRecognizeOnceAsyncButton;
var subscriptionKey, serviceRegion;
var SpeechSDK;
var recognizer;

document.addEventListener("DOMContentLoaded", function () {
  
fetch('/api')
.then(response => {
  const headers = response.headers;
  serviceRegion = headers.get('region');
  subscriptionKey = headers.get('subscriptionKey');
  endpointId = headers.get('endpointId');
})
.catch(error => console.error(error));

  startRecognizeOnceAsyncButton = document.getElementById("startRecognizeOnceAsyncButton");
  stopRecognizeOnceAsyncButton = document.getElementById("stopRecognizeOnceAsyncButton");
  stopRecognizeOnceAsyncButton.disabled = true;

  phraseDiv = document.getElementById("phraseDiv");

  startRecognizeOnceAsyncButton.addEventListener("click", function () {
    startRecognizeOnceAsyncButton.disabled = true;
    stopRecognizeOnceAsyncButton.disabled = false;

    var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
    
    speechConfig.enableDictation();
    speechConfig.speechRecognitionLanguage = "en-IN";
    speechConfig.endpointId = endpointId;
    
    var audioConfig  = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    
    recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    
    var final_text = phraseDiv.innerHTML;
    // console.log(`final_text ${final_text}`)
    var last_final_text = phraseDiv.innerHTML;
    extra_space_regex = /\\n\s+/g
    delete_last_word_regex = /(\S)*(\s)(delete )(the )?(last word)(s?)( )?/gi;
    delete_last_line_regex = /(\.|\?|\!)([^\.]*)(\.|\?|\!)([^\.]*)(delete )(the )?(last line)(\.)*/gi;
    delete_last_line_first_line_regex = /(.*)(delete )(the )?(last line)(\.)*/gi;
    fullstop_space_regex = /( \.)/;

    recognizer.recognizing = (s, e) => {
      console.log(`RECOGNIZING: Text=${e.result.text}`);
      var temp_text = final_text + " " + e.result.text;
      temp_text = temp_text.replace(extra_space_regex, "\n").trim();
      
      temp_text = temp_text.replace(delete_last_word_regex, "").trim();
      temp_text = temp_text.replace(fullstop_space_regex, ".").trim();
      phraseDiv.innerHTML = temp_text;
    };
    
    recognizer.recognized = (s, e) => {
      if (e.result.reason == SpeechSDK.ResultReason.RecognizedSpeech) {
        recognizedText = e.result.text
        final_text = (last_final_text + " " + recognizedText).replace(extra_space_regex, "\n").trim();
        final_text = final_text.replace(delete_last_word_regex, "").trim();
                
        if((delete_last_line_regex).test(final_text)){
          final_text = final_text.replace(delete_last_line_regex, "").trim();
        }

          else if((delete_last_line_first_line_regex).test(final_text)){
            final_text = final_text.replace(delete_last_line_first_line_regex, "").trim();
          }

        final_text = final_text.replace(fullstop_space_regex, ".").trim();

        last_final_text = final_text;
        phraseDiv.innerHTML = final_text;
        console.log(`RECOGNIZED: ${final_text}`);
      }
          else if (e.result.reason == SpeechSDK.ResultReason.NoMatch) {
            console.log("NOMATCH: Speech could not be recognized.");
          }
        };

    recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);

        if (e.reason == SpeechSDK.CancellationReason.Error) {
            console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            console.log("CANCELED: Did you set the speech resource key and region values?");
        }

        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = (s, e) => {
        console.log("\n    Session stopped event.");
        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync();


  });

  if (!!window.SpeechSDK) {
    SpeechSDK = window.SpeechSDK;
    startRecognizeOnceAsyncButton.disabled = false;

    // document.getElementById('content').style.display = 'block';
    document.getElementById('warning').style.display = 'none';
  }
});

stopRecognizeOnceAsyncButton.addEventListener("click", function () {
  recognizer.stopContinuousRecognitionAsync();
  startRecognizeOnceAsyncButton.disabled = false;
  stopRecognizeOnceAsyncButton.disabled = true;
})
clearButton.addEventListener("click", function(){
  recognizer.stopContinuousRecognitionAsync();
  phraseDiv.innerHTML = "";
  // final_text = "";
  // last_final_text = "";

  startRecognizeOnceAsyncButton.disabled = false;
  stopRecognizeOnceAsyncButton.disabled = true;
})