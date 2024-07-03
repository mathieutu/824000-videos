/* eslint-disable react/no-unescaped-entities */
'use client';
import { useEffect, useState, Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { FilePondFile } from 'filepond';
import Lottie from 'react-lottie';
import animationData from './assets/loading.json';

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

function HomeComponent() {
  const [apiMessage, setApiMessage] = useState<string>('');
  const [files, setFiles] = useState<FilePondFile[]>([]);
  const [folder, setFolder] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>();

  const isValidFolderId = folders?.some((folder) => folder.id === id);
  const folderName = folders?.find((folder) => folder.id === id);

  useEffect(() => {
    if (isValidFolderId) {
      setFolder(folderName?.name!);
    }
  }, [folderName, id]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const searchParams = useSearchParams();
  const allFoldersIds = async () => {
    try {
      const response = await fetch('/api');
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }
      const data = await response.json();
      return setFolders(data.folders);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    allFoldersIds();
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (files.length > 0) {
      setApiMessage('');
    }
  }, [files]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) {
      setApiMessage('aucun fichier sélectionné');
      return;
    }

    const formData = new FormData();
    files.forEach((filePondFile) => {
      const file = filePondFile.file;
      formData.append('file', file, file.name);
    });

    try {
      setLoading(true);
      const response = await fetch('/api?folder=' + folder + '&id=' + id, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        setApiMessage('Failed to upload files');
        throw new Error('Failed to upload files');
      }

      const uploadData = await response.json();
      setFiles([]);
      setApiMessage(uploadData.message);
    } catch (error) {
      console.error(error);
      setApiMessage('Fichier(s) non importé(s)');
    }
    setLoading(false);
  };

  if (!folders) {
    return (
      <div className='container'>
        <h1>Chargement...</h1>
      </div>
    );
  }

  if (!id || !isValidFolderId) {
    return (
      <div className='container'>
        <h1>Erreur</h1>
        <p>Impossible de charger la page, aucun evenement n'est selectionné</p>
      </div>
    );
  }

  return (
    <div className='container'>
      <h1>Importer vos photos ou vidéos de votre séjour :</h1>
      {folder && (
        <p
          style={{
            marginBottom: '20px',
          }}
        >
          le dossier de l'evenement : {folder}
        </p>
      )}
      <form onSubmit={handleSubmit} className='upload-form'>
        <FilePond
          files={files as any}
          onupdatefiles={setFiles}
          allowMultiple={true}
          acceptedFileTypes={['image/*', 'video/*']}
          labelIdle='Faites glisser vos photos ou vidéos ou <span class="filepond--label-action">cliquez pour les importer</span>'
        />
        {files.length > 0 && (
          <button type='submit' className='upload-button'>
            {' '}
            Envoyer
          </button>
        )}
      </form>
      {loading && <Lottie options={defaultOptions} height={100} width={100} />}
      {apiMessage.length > 0 && !loading && (
        <div
          style={{
            marginTop: '20px',
          }}
        >
          <p>{apiMessage}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeComponent />
    </Suspense>
  );
}
