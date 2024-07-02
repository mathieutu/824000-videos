"use client";
import { useEffect, useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { FilePondFile } from "filepond";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

export default function Home() {
  const [apiMessage, setApiMessage] = useState<string>("");
  const [files, setFiles] = useState<FilePondFile[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) {
      setApiMessage("aucun fichier sélectionné");
      return;
    }

    const formData = new FormData();
    files.forEach((filePondFile) => {
      const file = filePondFile.file;
      formData.append("file", file, file.name);
    });

    try {
      const response = await fetch("/api", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const uploadData = await response.json();
      setApiMessage(uploadData.message);
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
          files={files as any}
          onupdatefiles={setFiles}
          allowMultiple={true}
          acceptedFileTypes={["image/*", "video/*"]}
          labelIdle='Faites glisser vos photos ou vidéos ou <span class="filepond--label-action">cliquez pour les importer</span>'
        />
        <button type="submit" className="upload-button">
          Importer
        </button>
        <p>{apiMessage}</p>
      </form>
    </div>
  );
}
