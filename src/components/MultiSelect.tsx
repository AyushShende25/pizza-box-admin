import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

interface MultiSelectProps<T> {
	options: T[];
	selected: T[];
	onChange: (selected: T[]) => void;
	labelSelector: (item: T) => string;
	valueSelector: (item: T) => string | number;
	placeholder?: string;
}
function MultiSelect<T>({
	options,
	selected,
	onChange,
	labelSelector,
	valueSelector,
	placeholder = "Select options",
}: MultiSelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false);

	const toggleOption = (item: T) => {
		const value = valueSelector(item);
		if (selected.some((s) => valueSelector(s) === value)) {
			onChange(selected.filter((s) => valueSelector(s) !== value));
		} else {
			onChange([...selected, item]);
		}
	};

	const removeOption = (
		item: T,
		e: React.MouseEvent<SVGSVGElement, MouseEvent>,
	) => {
		e.stopPropagation(); // Prevent dropdown from toggling
		onChange(selected.filter((s) => valueSelector(s) !== valueSelector(item)));
	};
	return (
		<div className="relative min-w-44">
			<div
				onClick={() => setIsOpen((prev) => !prev)}
				className="px-3 py-2 rounded-lg cursor-pointer border"
			>
				{selected.length > 0 ? (
					<div className="flex flex-wrap gap-1">
						{selected.map((item) => (
							<span
								key={valueSelector(item)}
								className="px-2 py-1 bg-muted rounded-md flex items-center text-sm"
							>
								{labelSelector(item)}
								<X
									size={12}
									className="ml-1 cursor-pointer"
									onClick={(e) => removeOption(item, e)}
								/>
							</span>
						))}
					</div>
				) : (
					<div className="flex justify-between items-center gap-4 text-sm">
						<span>{placeholder}</span>
						<ChevronDown size={20} />
					</div>
				)}
			</div>

			{isOpen && (
				<ul className="absolute bg-card shadow border mt-1 rounded-md p-1 w-full z-20 max-h-48 overflow-y-auto">
					{options.map((item) => (
						<li
							key={valueSelector(item)}
							className="hover:bg-muted px-3 py-1 rounded cursor-pointer"
							onClick={() => toggleOption(item)}
						>
							{labelSelector(item)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
export default MultiSelect;
