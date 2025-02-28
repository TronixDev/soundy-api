import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapi";

export function generateOpenApiDocument() {
	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			title: "Soundy API's",
			version: "1.0.0",
			description:
				"API for getting music recommendations and similar tracks/artists for Soundy",
		},
		servers: [
			{
				url: "https://localhost:3000",
				description: "Development server",
			},
			{
				url: "https://soundy-api.vercel.app",
				description: "Production server",
			},
		],
	});
}
