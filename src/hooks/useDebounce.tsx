import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay = 500) {
	const [debouncedValue, setdebouncedValue] = useState<T>(value);
	useEffect(() => {
		const timeout = setTimeout(() => setdebouncedValue(value), delay);

		return () => clearTimeout(timeout);
	}, [value, delay]);

	return debouncedValue;
}
export default useDebounce;
