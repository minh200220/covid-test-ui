// collect DOMs
const display = document.querySelector(".display");
const controllerWrapper = document.querySelector(".controllers");

const State = ["Initial", "Record", "Download"];
let stateIndex = 0;
let mediaRecorder,
  chunks = [],
  audioURL = "",
  file = null;

// mediaRecorder setup for audio
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  console.log("mediaDevices supported..");

  navigator.mediaDevices
    .getUserMedia({
      audio: true,
    })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav; codecs=opus" });
        file = new File(chunks, "record-audio.wav", {
          type: "audio/wav; codecs=opus",
        });
        chunks = [];
        console.log(file);
        audioURL = window.URL.createObjectURL(blob);
        document.querySelector("audio").src = audioURL;
      };
    })
    .catch((error) => {
      console.log("Following error has occured : ", error);
    });
} else {
  stateIndex = "";
  application(stateIndex);
}

const clearDisplay = () => {
  display.textContent = "";
};

const clearControls = () => {
  controllerWrapper.textContent = "";
};

const record = () => {
  stateIndex = 1;
  mediaRecorder.start();
  application(stateIndex);
};

const stopRecording = () => {
  stateIndex = 2;
  mediaRecorder.stop();
  application(stateIndex);
};

const submit = () => {
  let fd = new FormData();

  fd.append("audio", file);

  fetch("http://localhost:8000/api/predict/", {
    method: "POST",
    body: fd,
  })
    .then((response) => console.log(response.json()))
    .then((data) => {
      let res = data["prob"];
      document.getElementById("response").innerHTML = res || 0.56789;
    })
    .catch((e) => console.log("Error message", e));
};

const downloadAudio = () => {
  const downloadLink = document.createElement("a");
  downloadLink.href = audioURL;
  downloadLink.setAttribute("download", "audio");
  downloadLink.click();
};

const addButton = (id, funcString, text) => {
  const btn = document.createElement("button");
  btn.id = id;
  btn.setAttribute("onclick", funcString);
  btn.textContent = text;
  controllerWrapper.append(btn);
};

const addMessage = (text) => {
  const msg = document.createElement("p");
  msg.textContent = text;
  display.append(msg);
};

const addAudio = () => {
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = audioURL;
  display.append(audio);
};

const application = (index) => {
  switch (State[index]) {
    case "Initial":
      clearDisplay();
      clearControls();

      addButton("record", "record()", "Start Recording");
      break;

    case "Record":
      clearDisplay();
      clearControls();

      addMessage("Recording...");
      addButton("stop", "stopRecording()", "Stop Recording");
      break;

    case "Download":
      clearControls();
      clearDisplay();

      addAudio();
      addButton("submit", "submit()", "Submit Record");
      addButton("record", "record()", "Record Again");
      break;

    default:
      clearControls();
      clearDisplay();

      addMessage("Your browser does not support mediaDevices");
      break;
  }
};

application(stateIndex);
