function Loader() {
	return (
		<div className="h-screen flex items-center justify-center gap-4">
			{[...Array(3)].map((_, index) => (
				<div
					key={index}
					className="bg-primary h-8 w-8 rounded-full animate-bounceY"
					style={{ animationDelay: `${index * 0.2}s` }}
				/>
			))}
		</div>
	);
}
export default Loader;
