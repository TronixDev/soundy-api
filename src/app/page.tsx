export default async function ApiDocsPage() {
	return (
		<div className="w-full h-full">
			<iframe
				src="/api/docs"
				className="w-full h-screen border-0"
				title="API Documentation"
			/>
		</div>
	);
}
