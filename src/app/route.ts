import { ApiReference } from "@scalar/nextjs-api-reference";
import { generateOpenApiDocument } from "@/lib/generateOpenApi";

const config = {
	spec: {
		content: JSON.stringify(generateOpenApiDocument()),
	},
};

export const GET = ApiReference(config);
