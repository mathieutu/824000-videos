import express from 'express'
import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import { createVideo } from './createVideo.js'
import { config } from 'dotenv'

config()

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const credentialsPath = path.join('./credentials.json');

// Configure Google OAuth2 authentication
const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

// Google Drive API instance
const drive = google.drive({ version: 'v3', auth });

async function downloadFile(fileId, filePath) {
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    const dest = fs.createWriteStream(filePath);
    return new Promise((resolve, reject) => {
        res.data
            .on('end', () => {
                console.log(`Downloaded file ${fileId} to ${filePath}`);
                resolve();
            })
            .on('error', err => {
                console.error(`Error downloading file ${fileId}. ${err.message}`);
                reject(err);
            })
            .pipe(dest);
    });
}

async function checkFolderExists(folderId) {
    try {
        await drive.files.get({
            fileId: folderId,
            fields: 'id',
        });
        return true;
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return false;
        } else {
            throw err;
        }
    }
}

async function listFoldersInFolder(folderId) {
    try {
        // If dossier existe
        const folderExists = await checkFolderExists(folderId);
        if (!folderExists) {
            console.log(`Le dossier avec l'ID ${folderId} n'existe pas.`);
            return [];
        }

        // Liste des dossiers dans le dossier
        const res = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
        });

        const folders = res.data.files;
        console.log(`Found ${folders.length} folders in the folder.`);
        console.log(folders.map(folder => ({ id: folder.id, name: folder.name })));
       return folders.map(folder => ({ id: folder.id, name: folder.name }));
    } catch (err) {
        console.error('Error listing or downloading files:', err);
        throw err;
    }
}


async function listFilesInFolder(folderId) {
    try {
        // If dossier existe
        const folderExists = await checkFolderExists(folderId);
        if (!folderExists) {
            console.log(`Le dossier avec l'ID ${folderId} n'existe pas.`);
            return [];
        }

        // Liste des fichiers dans le dossier
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name)',
        });

        const files = res.data.files;
        console.log(`Found ${files.length} files in the folder.`);
        console.log(files.map(file => ({ id: file.id, name: file.name })));
       return files.map(file => ({ id: file.id, name: file.name }));
    } catch (err) {
        console.error('Error listing or downloading files:', err);
        throw err;
    }
}

app.get('/folders', async (req, res) => {
    try {
        const folderId = process.env.FOLDER_ID;
        const folders = await listFoldersInFolder(folderId);
        res.json(folders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/files', async (req, res) => {
    try {
        const { folderId } = req.query;
        if (!folderId) {
            throw new Error('Missing folderId query parameter');
        }
        const files = await listFilesInFolder(folderId);
        res.json(files);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/download', async (req, res) => {
    try {
        const { fileIds } = req.body;
        const downloadDir = path.join('./downloaded_files');
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }

        const downloadedFiles = await Promise.all(fileIds.map(async fileId => {
            const file = await drive.files.get({
                fileId,
                fields: 'id, name',
            }).then(res => res.data).catch(err => {
                console.error(`Error fetching file ${fileId}. ${err.message}`);
            });
            
            if (file) {
                const fileExtension = path.extname(file.name);
                const fileIdWithExtension = `${file.id}${fileExtension}`;
                const filePath = path.join(downloadDir, fileIdWithExtension);
                await downloadFile(file.id, filePath);
            }
        }));
        createVideo();

        res.json({ downloadedFiles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});


