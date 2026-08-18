import { Input } from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import RichBox from "../RichBox";



export default function UzEditor({ value, onChange }) {

    const handleChange = (e) => {
        const { name, value: inputValue } = e.target;
        onChange({ ...value, [name]: inputValue?.toString() || "" });
    };
    const handleRichBoxChange = (newValue) => {
        onChange({ ...value, description: newValue });
    };

    return (
        <div className="editor-container">
            <div>
                <Input
                    label="Sarlavha"
                    name="title"
                    value={value?.title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mt-[20px]">
            <RichBox value={value?.description?.toString() || ""} onChange={handleRichBoxChange} />
            </div>
        </div>
    );
}