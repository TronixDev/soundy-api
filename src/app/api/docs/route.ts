import { ApiReference } from "@scalar/nextjs-api-reference";
import { generateOpenApiDocument } from "@/lib/generateOpenApi";

const config = {
	spec: {
		content: JSON.stringify(generateOpenApiDocument()),
	},
	configuration: {
		title: "Soundy API Documentation",
		theme: {
			colors: {
				primary: {
					main: "#4F46E5",
				},
			},
		},
		navigation: {
			location: "left",
			scrollIntoViewOnLinkClick: true,
		},
		metadata: {
			expandResponses: "200,201",
			showExpandButton: true,
		},
		layout: {
			showInfo: true,
			showComponents: true,
			showSecurity: true,
		},
	},
};

export const GET = ApiReference(config);
