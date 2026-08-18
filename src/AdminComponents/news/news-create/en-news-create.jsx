import { Input, Textarea } from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import RichBox from "../../RichBox";



export default function EnNewsCreate({ value, onChange }) {


    const handleChange = (e) => {
        const { name, value } = e.target;
        onChange((prev) => ({ ...prev, [name]: value }));
    };

    const handleRichBoxChange = (newValue) => {
        onChange({ ...value, summary: newValue });
    };

    return (
        <div>
            <div>
                <Input
                    label="Sarlavha"
                    name="title"
                    value={value?.title || ""}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mt-[20px]">
                <Textarea
                    label="Malumot"
                    name="description"
                    value={value?.description || ""}
                    onChange={handleChange}
                    required
                />

                <div className="mt-[20px]">
                    <RichBox value={value?.summary?.toString() || ""} onChange={handleRichBoxChange} />
                </div>
            </div>
        </div>
    );
}