"use client";
import { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (files.length === 0) {
      console.error('No files selected');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const uploadData = await response.json();
      console.log(uploadData);

      setFiles([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>Importer vos photos ou vidéos de votre séjour :</h1>
      <form onSubmit={handleSubmit} className="upload-form">
        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={true}
          acceptedFileTypes={['image/*', 'video/*']}
          labelIdle='Faites glisser vos photos ou vidéos ou <span class="filepond--label-action">cliquez pour les importer</span>'
        />
        <button type="submit" className="upload-button">Importer</button>
      </form>
    </div>
  );
}
