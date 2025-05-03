feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');

const ctx = canvas.getContext('2d');
const screenshotImage = document.querySelector('img');
const buttons = [...controls.querySelectorAll('button')];
let streamStarted = false;
let model = null;

const [play, pause, screenshot, ai] = buttons;

const constraints = {
  video: {
    width: {
      min: 750,
      ideal: 750,
      max: 750,
    },
    height: {
      min: 750,
      ideal: 750,
      max: 750
    },
  }
};

const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  const options = videoDevices.map(videoDevice => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join('');
};


cameraOptions.onchange = async () => {
  updateSource();
}


function detect() {
  
  model.detect(video).then(predictions => {
    console.log('Predictions: ', JSON.stringify(predictions));

    draw(predictions);


      window.requestAnimationFrame(() => detect());
  }).catch(e => {
    console.log(e);
   

      window.requestAnimationFrame(() => detect());
  });
}

function draw(predictions) {

  //clear canvas
  ctx.clearRect(0, 0, video.width, video.height);

  //draw inputimage
  ctx.drawImage(video, 0, 0);

  ctx.strokeStyle = 'green';
  ctx.font = "15px Arial";
  predictions.map(prediction => {
    ctx.strokeText(prediction.class + " score: " + prediction.score.toFixed(2), prediction.bbox[0] + 10, prediction.bbox[1] + 20);
    ctx.strokeRect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
  })

}

ai.onclick = async () => {
  console.log('ai clicked');
  if(model === null) {
    model = await cocoSsd.load();
  }

  detect();
}

play.onclick = async () => {
  if (streamStarted) {
    video.play();
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    return;
  }
  updateSource();
};

async function updateSource() {
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const selectedDevice = devices.find(device => device.deviceId === cameraOptions.value);
    console.log(selectedDevice);
    const updatedConstraints = { video: {...selectedDevice.toJSON(), ...constraints.video}};

    
    console.log(updatedConstraints);
    startStream(updatedConstraints);
  }
}




const startStream = async (constraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  handleStream(stream);
};



const handleStream = (stream) => {
  video.srcObject = stream;
  play.classList.add('d-none');
  pause.classList.remove('d-none');
  screenshot.classList.remove('d-none');
  streamStarted = true;
};

getCameraSelection();