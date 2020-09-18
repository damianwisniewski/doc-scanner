import * as BlinkIDSDK from "@microblink/blinkid-in-browser-sdk";
import Jimp from 'jimp';

import CanvasFeedback from './CavasFeedback';

export default class Recognizer {
	static #LICENCE_KEY = "sRwAAAYJbG9jYWxob3N0r/lOPig/w35CpJlWLo08ZM/NxBq9/sPpgBYjga+qpRc1KyJ/i40yuF4L78tohrIQbigHGdSXIA7W1MgmTtXuIRO60zs55BMGiaqrPsjS69A0SC5lpbqieWrCzby8SCvB8OnORSZUw26QSMl7eZhZ8s/DzgeN35dE7rN48TYRrRPOYe7urmhc8G/aGdRxSHETF3jff7I5IL99XcGcI9+n/yr2f7NCxkAFelRBF56k8PVqnDHokzRVnFDX+1j9e9AIMbEnnyo3AA=="
	
	wasmSDK = null;
	loadSettings = null;
	callbacks = {};
	clears = {};

	async init(callbacks) {
		if (!BlinkIDSDK.isBrowserSupported()) {
			throw new Error('Recognizer does not support this browser!');
		}

		this.loadSettings = new BlinkIDSDK.WasmSDKLoadSettings(Recognizer.#LICENCE_KEY);
		this.callbacks = callbacks || {};

		try {
			const wasmSDK = await BlinkIDSDK.loadWasmModule(this.loadSettings);
			this.wasmSDK = wasmSDK;
		} catch (error) {
			throw new Error(`Recognizer does not support this browser! ${error}`)
		}
	}

	async scan(scanField, file, outputCanvas) {
		const { onQuadDetection, onScanFeedback, ...rest } = this.callbacks;

		let result;
		let outputField;

		if (outputCanvas && scanField instanceof HTMLVideoElement) {
			outputField = new CanvasFeedback(scanField, outputCanvas);
		}

		const genericIDRecognizer = await BlinkIDSDK.createBlinkIdRecognizer(this.wasmSDK);
		const recognizerRunner = await BlinkIDSDK.createRecognizerRunner(
			this.wasmSDK,
			[genericIDRecognizer],
			false,
			{
				onQuadDetection: (e) => {
					onScanFeedback && this.statusChanges(e);
					outputField && outputField.drawQuad(e);
				},
				...rest,
			}
		);

		if (scanField instanceof HTMLVideoElement) {
			result = await this.videoRecognizer(scanField, recognizerRunner, genericIDRecognizer, outputField);
		} else if (scanField instanceof HTMLImageElement) {
			result = await this.imageRecognizer(scanField, recognizerRunner, genericIDRecognizer, file)
		}

		recognizerRunner.delete();
		genericIDRecognizer.delete();
		return result;
	}

	async videoRecognizer(scanField, recognizerRunner, IDRecognizer, outputField) {
		const stream = await navigator.mediaDevices.getUserMedia({ video: {
			width: {
				ideal: 1280,
			},
			height: {
				ideal: 720,
			}
		} });
		scanField.controls = false;
		scanField.srcObject = stream;
		const videoRecognizer = new BlinkIDSDK.VideoRecognizer(
			scanField,
			recognizerRunner
		);

		this.clears.releaseCamera = async () => {
			await videoRecognizer.cancelRecognition();
			await videoRecognizer.releaseVideoFeed();
		}

		const processResult = await videoRecognizer.recognize();
		const result = await this.getScanResult(processResult, IDRecognizer);
		this.captureImageFromVideo(scanField, outputField);
		videoRecognizer.releaseVideoFeed();
		this.clears.releaseCamera = null;
		return result;
	}

	captureImageFromVideo(scanField, outputField) {
		outputField.drawContext.drawImage(scanField, 0, 0, scanField.videoWidth, scanField.videoHeight);
	}

	async imageRecognizer(scanField, recognizerRunner, IDRecognizer, image) {
		scanField.src = await this.addPaddingToImage(image, 15);
		await scanField.decode();

		const imageFrame = BlinkIDSDK.captureFrame(scanField);
		const processResult = await recognizerRunner.processImage(imageFrame);
		return await this.getScanResult(processResult, IDRecognizer);
	}

	async getScanResult(processResult, IDRecognizer) {
		if (processResult !== BlinkIDSDK.RecognizerResultState.Empty) {
			const genericIDResults = await IDRecognizer.getResult();
			if (genericIDResults.state !== BlinkIDSDK.RecognizerResultState.Empty) {
				return genericIDResults;
			}
		} else {
			throw new Error("Could not extract information!");
		}
	}

	async addPaddingToImage(image, padding) {
		const imagee = await Jimp.read(image);
		await imagee.contain(imagee.bitmap.width, imagee.bitmap.height - padding, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
		await imagee.contain(imagee.bitmap.width - padding, imagee.bitmap.height, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
		return await imagee.getBase64Async('image/png');
	}

	statusChanges(displayable) {
		const { onScanFeedback } = this.callbacks;

		switch (displayable.detectionStatus) {
			case BlinkIDSDK.DetectionStatus.CameraAtAngle:
				onScanFeedback("Advice: Adjust the angle");
				break;
			case BlinkIDSDK.DetectionStatus.CameraTooHigh:
				onScanFeedback("Advice: Move document closer");
				break;
			case BlinkIDSDK.DetectionStatus.CameraTooNear:
			case BlinkIDSDK.DetectionStatus.DocumentTooCloseToEdge:
			case BlinkIDSDK.DetectionStatus.Partial:
				onScanFeedback("Advice: Move document farther");
				break;
			default:
				break;
		}
	}
}
