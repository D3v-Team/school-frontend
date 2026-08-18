import React, { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { $api } from "../utils";

export default function RichBox({ value, onChange }) {
    const editorRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (blobInfo, progress) => {
        return new Promise((resolve, reject) => {
            const file = blobInfo.blob();
            setIsLoading(true);

            const formData = new FormData();
            formData.append("photo", file);

            $api.post("upload-photo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    progress((progressEvent.loaded / progressEvent.total) * 100);
                },
            })
                .then((response) => {
                    setIsLoading(false);
                    if (response.data?.data?.photo?.[0]?.url) {
                        resolve(response.data.data.photo[0].url);
                    } else {
                        reject("Ошибка загрузки изображения");
                    }
                })
                .catch(() => {
                    setIsLoading(false);
                    reject("Ошибка загрузки изображения");
                });
        });
    };

    return (
        <Editor
            apiKey="4butsa929dbju0w6jd4ol1rug03det6wemt3hfdfyn12kg8q"
            onInit={(evt, editor) => (editorRef.current = editor)}
            value={value}
            onEditorChange={(content) => onChange(content)}
            init={{
                height: 500,
                menubar: true,
                plugins:
                    "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
                toolbar:
                    "undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | code preview fullscreen",
                images_upload_handler: handleImageUpload,
                automatic_uploads: true,
                image_advtab: true,
                paste_data_images: true,
                file_picker_types: "image",
                file_picker_callback: (callback) => {
                    const input = document.createElement("input");
                    input.setAttribute("type", "file");
                    input.setAttribute("accept", "image/*");
                    input.onchange = function () {
                        const file = this.files[0];
                        const reader = new FileReader();
                        reader.onload = function () {
                            callback(reader.result, { title: file.name });
                        };
                        reader.readAsDataURL(file);
                    };
                    input.click();
                },
                table_toolbar: "tableprops cell row column | tableinsertdialog",
                images_upload_url: "upload-photo",
                file_picker_callback_types: "image",
            }}
        />
    );
}
