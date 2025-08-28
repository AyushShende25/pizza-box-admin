import type { AnyFieldApi } from "@tanstack/react-form";

function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && !field.state.meta.isValid ? (
				<em className="text-destructive font-light">
					{field.state.meta.errors.map((error) => error?.message).join(", ")}
				</em>
			) : null}
		</>
	);
}
export default FieldInfo;
