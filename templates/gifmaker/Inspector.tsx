'use client';
import { Button } from '@/components/shadcn/Button';
import { Input } from '@/components/shadcn/Input';
import { useFrameConfig, useFrameId, useUploadImage } from '@/sdk/hooks';
import { useRef, useState, useEffect } from 'react';
import type { Config } from '.';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function Inspector() {
	const frameId = useFrameId();
	const [config, updateConfig] = useFrameConfig<Config>();
	const uploadImage = useUploadImage();
	const imageRef = useRef<HTMLImageElement | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const logs = useRef(null);
	const [file, setFile] = useState<File>();
	const ffmpegRef = useRef(new FFmpeg());

	//LOAD FFMPEG INGINE
	const load = async () => {
		const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
		const ffmpeg = ffmpegRef.current;

		// toBlobURL is used to bypass CORS issue, urls with the same
		// domain can be used directly.
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(
				`${baseURL}/ffmpeg-core.wasm`,
				'application/wasm',
			),
		});
	};

	setTimeout(load, 1000);

	const inputStart = useRef<HTMLInputElement>(null);
	const inputDuration = useRef<HTMLInputElement>(null);
	const inputCaption = useRef<HTMLInputElement>(null);
	const inputFontSize = useRef<HTMLInputElement>(null);
	const inputFontColor = useRef<HTMLInputElement>(null);
	const inputY = useRef<HTMLInputElement>(null);
	const inputButtonLabel = useRef<HTMLInputElement>(null);
	const inputButtonLink = useRef<HTMLInputElement>(null);

	const confDefault = {
		start: '0',
		duration: '10',
		caption: 'Hello from FrameTrain',
		fontsize: '30',
		fontcolor: 'white',
		y: '20',
		label: 'Do It',
		link: 'https://frametra.in',
	};


	//CRATE GIF FROM PARAMS AND PREVIEW
	let data = null;
	let params = {};

	const transcode = async () => {
		try {
			logs.current.value = 'Creating GIF. Please wait. . .';
			params = {
				start: inputStart.current?.value.toString() || confDefault.start,
				duration: inputDuration.current?.value.toString() || confDefault.duration,
				caption: inputCaption.current?.value || confDefault.caption,
				y: inputY.current?.value.toString() || confDefault.y,
				fontsize: inputFontSize.current?.value.toString() || confDefault.fontsize,
				fontcolor: inputFontColor.current?.value || confDefault.fontcolor,
				label: inputButtonLabel.current?.value || confDefault.label,
				link: inputButtonLink.current?.value || confDefault.link,
			};
			const ffmpeg = ffmpegRef.current;
			const ty = file.type.substring(file.type.indexOf('/') + 1);
			await ffmpeg.writeFile(`input.${ty}`, await fetchFile(file));
			await ffmpeg.writeFile(
				'arial.ttf',
				await fetchFile('https://ipfs.io/ipfs/QmcWFzXah4SAbKruiDjUN9rgSzztDwJU4F9d6qreRZNF1C'),
			); 
			ffmpeg.exec([
				'-i',
				`input.${ty}`,
				'-ss',
				params.start,
				'-t',
				params.duration,
				'-r',
				'8',
				'-vf',
				`scale=-1:210,drawtext=fontfile=arial.ttf:text='${params.caption}':fontcolor=${params.fontcolor}:fontsize=${params.fontsize}:x=(w-text_w)/2:y=(h-text_h)-${params.y}`,
				'output.gif',
			]);

			data = await ffmpeg.readFile('output.gif');
			if (imageRef.current) {
				const url = URL.createObjectURL(
					new Blob([data.buffer], { type: 'image/gif' }),
				);
				imageRef.current.src = url;
			}
			logs.current.value = `Successfully!`;
		} catch (e) {
			logs.current.value = `Something went wrong. Upload a file and check the params. ${JSON.stringify(e)}`;
		}
	};

	//CREATE FRAME AND STORE CONFIGURATION
	const create = async () => {
		try {
			if (!data) {
				logs.current.value = 'Preview not found. Hit "Privew" button.';
				return;
			}
			logs.current.value = 'Creating Frame . . .';
			const b64 = Buffer.from(data).toString('base64');
			const { filePath } = await uploadImage({
				base64String: b64,
				contentType: 'image/gif',
			});
			const gifUrl = process.env.NEXT_PUBLIC_CDN_HOST + '/' + filePath;
			console.log(gifUrl);
			updateConfig({
				gif: gifUrl,
				label: params.label,
				link: params.link,
				params: params,
			});
			logs.current.value = 'Successfully!';
		} catch (e) {
			logs.current.value = 'Something went wrong. Perhaps, the GIF is too large. Check params and try again.';
		}
	};

	useEffect(() => {
		if (!file) return;
		videoRef.current.src = URL.createObjectURL(file);
	}, [file]);

	return (
		<div className="w-full h-full space-y-4">
			<h1 className="text-lg font-semibold">GIF Maker</h1>
			<video ref={videoRef} width="100%" controls></video>
			<label
				htmlFor="uploadFile"
				className="flex cursor-pointer items-center justify-center rounded-md  py-1.5 px-2 text-md font-medium bg-border  text-primary hover:bg-secondary-border"
			>
				Upload a video file
				<Input
					id="uploadFile"
					accept="video/*"
					type="file"
					onChange={(e) => {
						if (e.target.files?.[0]) {
							setFile(e.target.files?.[0]);
						}
					}}
					className="sr-only"
				/>
			</label>
			<h3 className="text-lg font-semibold">Enter parameters</h3>
			<div className="flex flex-col gap-2 ">
				<Input
					className="text-lg"
					placeholder="Start time in sec or mm:ss (default: 0)"
					ref={inputStart}
				/>
				<Input
					className="text-lg"
					placeholder="Duration in sec (default: 10)"
					ref={inputDuration}
				/>
				<Input
					className="text-lg"
					placeholder="Caption (default: Hello from FrameTrain)"
					ref={inputCaption}
				/>
				<Input
					className="text-lg"
					placeholder="Position Y (default: 20)"
					ref={inputY}
				/>
				<Input
					className="text-lg"
					placeholder="Font size (default: 30)"
					ref={inputFontSize}
				/>
				<Input
					className="text-lg"
					placeholder="Font color (default: white)"
					ref={inputFontColor}
				/>
				<Input
					className="text-lg"
					placeholder="Button label (default: LINK)"
					ref={inputButtonLabel}
				/>
				<Input
					className="text-lg"
					placeholder="Button link (default: https://frametra.in)"
					ref={inputButtonLink}
				/>
				<img ref={imageRef} width="100%"></img>
				<br />
				<button
					onClick={transcode}
					className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded"
				>
					Preview
				</button>
				Console: <textarea style={{ color: "#00FFFF" }} ref={logs}></textarea>
				<p>Note: The recommended gif's duration is less 10 sec.</p>
				<Button
					onClick={create}
					className="w-full bg-border hover:bg-secondary-border text-primary"
				>
					Create Frame
				</Button>
			</div>
			<Button
				className="w-full"
				onClick={() => {
					const { params } = config;
					inputStart.current.value = config.params?.start || confDefault.start;
					inputDuration.current.value =
						config.params?.duration || confDefault.duration;
					inputCaption.current.value =
						config.params?.caption || confDefault.caption;
					inputY.current.value = config.params?.y || confDefault.y;
					inputFontSize.current.value =
						config.params?.fontsize || confDefault.fontsize;
					inputFontColor.current.value =
						config.params?.fontcolor || confDefault.fontcolor;
					inputButtonLabel.current.value =
						config.params?.label || confDefault.label;
					inputButtonLink.current.value =
						config.params?.link || confDefault.link;
				}}
			>
				Pre-saved configuration
			</Button>
		</div>
	);
}
