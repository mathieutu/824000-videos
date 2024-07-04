import Editly from 'editly';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

const ffmpegPath = ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
const ffprobePath = ffprobeStatic.path.replace('app.asar', 'app.asar.unpacked');

export async function createVideo() {
    try {
        const images = fs.readdirSync('./downloaded_files');
        let imageList = [];

        for (let index = 0; index < images.length; index++) {
            const element = images[index];
            imageList.push(`downloaded_files/${element}`);
        }

        const clips = imageList.map(image => {
            const extension = image.split('.').pop().toLowerCase();
            if (['jpg', 'png', 'jpeg'].includes(extension)) {
                return { duration: 5, layers: [{ type: 'image', path: image }] };
            } else if (['mp4', 'mov'].includes(extension)) {
                return { duration: 5, layers: [{ type: 'video', path: image }] };
            }
        }).filter(clip => clip !== undefined); // Filtrer les clips non définis

        if (clips.length === 0) {
            throw new Error('No valid clips to process.');
        }

        await Editly({
            width: 1920,
            height: 1080,
            outPath: '/outputs/output.mp4',
            defaults: {
                transition: {
                    duration: 0.2,
                    name: 'GlitchMemories',
                }
            },
            clips: clips,
            audioFilePath: './music/sound1.mp3',
            fps: 30,
            ffmpegPath: ffmpegPath,
            ffprobePath: ffprobePath
        });

        console.log('Video created successfully!');
        return true;
    } catch (error) {
        console.error('Error creating video:', error);
        return false;
    }
}
