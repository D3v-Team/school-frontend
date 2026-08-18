import { Input } from "@material-tailwind/react";

export default function PositionUz({ value, onChange }) {
    return (
        <div className="mt-[10px]">
            <Input
                label="Position"
                name="title"
                value={value?.position || ""}
                onChange={(e) => onChange({ ...value, position: e.target.value })}
                required
            />
        </div>
    );
}
