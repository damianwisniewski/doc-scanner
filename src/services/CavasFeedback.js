export default class CanvasFeedback {
  constructor(cameraFeed, cameraFeedback) {
    this.cameraFeedback = cameraFeedback;
    this.cameraFeed = cameraFeed;
    this.drawContext = cameraFeedback.getContext("2d");
  }

  drawQuad(quad) {
    this.clearDrawCanvas();
    this.setupColor(quad);
    this.applyTransform(quad.transformMatrix);
    this.drawContext.beginPath();
    this.drawContext.moveTo(quad.topLeft.x, quad.topLeft.y);
    this.drawContext.lineTo(quad.topRight.x, quad.topRight.y);
    this.drawContext.lineTo(quad.bottomRight.x, quad.bottomRight.y);
    this.drawContext.lineTo(quad.bottomLeft.x, quad.bottomLeft.y);
    this.drawContext.closePath();
    this.drawContext.stroke();
  }

  applyTransform(transformMatrix) {
    const canvasAR = this.cameraFeedback.width / this.cameraFeedback.height;
    const videoAR = this.cameraFeed.videoWidth / this.cameraFeed.videoHeight;
    let xOffset = 0;
    let yOffset = 0;
    let scaledVideoHeight = 0;
    let scaledVideoWidth = 0;
    if (canvasAR > videoAR) {
      scaledVideoHeight = this.cameraFeedback.height;
      scaledVideoWidth = videoAR * scaledVideoHeight;
      xOffset = (this.cameraFeedback.width - scaledVideoWidth) / 2.0;
    } else {
      scaledVideoWidth = this.cameraFeedback.width;
      scaledVideoHeight = scaledVideoWidth / videoAR;
      yOffset = (this.cameraFeedback.height - scaledVideoHeight) / 2.0;
    }

    this.drawContext.translate(xOffset, yOffset);
    this.drawContext.scale(
      scaledVideoWidth / this.cameraFeed.videoWidth,
      scaledVideoHeight / this.cameraFeed.videoHeight
    );

    this.drawContext.transform(
      transformMatrix[0],
      transformMatrix[3],
      transformMatrix[1],
      transformMatrix[4],
      transformMatrix[2],
      transformMatrix[5]
    );
  }

  clearDrawCanvas() {
    this.cameraFeedback.width = this.cameraFeedback.clientWidth;
    this.cameraFeedback.height = this.cameraFeedback.clientHeight;
    this.drawContext.clearRect(0, 0, this.cameraFeedback.width, this.cameraFeedback.height);
  }
  
  setupColor(displayable) {
    let color = "#FFFF00FF";
    if (displayable.detectionStatus === 0) {
      color = "#FF0000FF";
    } else if (displayable.detectionStatus === 1) {
      color = "#00FF00FF";
    }
    this.drawContext.fillStyle = color;
    this.drawContext.strokeStyle = color;
    this.drawContext.lineWidth = 5;
  }
}