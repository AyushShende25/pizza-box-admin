import { Pizza } from "lucide-react";

function Logo() {
	return (
		<div className="flex items-center space-x-2">
			<div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
				<Pizza className="w-6 h-6 text-primary-foreground" />
			</div>
			<span className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
				Pizza Box
			</span>
		</div>
	);
}
export default Logo;
