import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { NodePath } from "@babel/traverse";
import type {
	FunctionDeclaration,
	CallExpression,
	ObjectProperty,
	Identifier,
} from "@babel/types";

interface RouteInfo {
	path: string;
	method: string;
	params?: {
		name: string;
		required: boolean;
		type: string;
		description?: string;
	}[];
	responses: Array<{
		status: number;
		description: string;
		content: {
			"application/json": {
				schema: {
					type: string;
					properties: Record<string, unknown>;
				};
			};
		};
	}>;
}

export function generateOpenApiDocument() {
	const routes = scanRoutes();

	return {
		openapi: "3.0.0",
		info: {
			title: "Soundy API",
			version: "1.0.0",
			description:
				"API for getting music recommendations and similar tracks/artists for Soundy",
		},
		servers: [
			{
				url: "https://api.soundy.my.id",
				description: "Production server",
			},
		],
		paths: generatePaths(routes),
	};
}

function scanRoutes(): RouteInfo[] {
	const routesDir = join(process.cwd(), "src", "app");
	const routes: RouteInfo[] = [];

	function scanDirectory(dir: string, basePath = "") {
		const entries = readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);

			if (
				entry.isDirectory() &&
				!entry.name.startsWith("_") &&
				!entry.name.startsWith(".")
			) {
				// Skip special Next.js directories and root path
				if (
					!["api", "components", "lib", "utils", "types"].includes(entry.name)
				) {
					// Use entry.name for the path instead of joining
					const newPath = basePath ? `${basePath}/${entry.name}` : entry.name;
					scanDirectory(fullPath, newPath);
				}
			} else if (entry.name === "route.ts" || entry.name === "route.tsx") {
				// Skip root route
				if (basePath === "") continue;

				const route = parseRouteFile(fullPath, `/${basePath}`);
				if (route) routes.push(route);
			}
		}
	}

	scanDirectory(routesDir);
	return routes;
}

function parseRouteFile(filePath: string, basePath: string): RouteInfo | null {
	const content = readFileSync(filePath, "utf-8");
	const ast = parse(content, {
		sourceType: "module",
		plugins: ["typescript", "jsx"],
	});

	const routeInfo: RouteInfo = {
		// Ensure path starts with / and doesn't have double slashes
		path: basePath.startsWith("/") ? basePath : `/${basePath}`,
		method: "get",
		responses: [],
	};

	traverse(ast, {
		FunctionDeclaration(path: NodePath<FunctionDeclaration>) {
			if (path.node.id?.name === "GET") {
				routeInfo.method = "get";

				// Parse parameters from function
				const params: RouteInfo["params"] = [];
				path.traverse({
					CallExpression(callPath: NodePath<CallExpression>) {
						if (
							callPath.node.callee.type === "MemberExpression" &&
							callPath.node.callee.property.type === "Identifier" &&
							callPath.node.callee.property.name === "get"
						) {
							const paramNode = callPath.node.arguments[0];
							const paramName =
								paramNode && "value" in paramNode
									? String(paramNode.value)
									: undefined;
							if (paramName) {
								params.push({
									name: paramName,
									required: true,
									type: "string",
								});
							}
						}
					},
				});

				if (params.length > 0) {
					routeInfo.params = params;
				}

				// Parse responses
				path.traverse({
					CallExpression(callPath: NodePath<CallExpression>) {
						if (
							callPath.node.callee.type === "MemberExpression" &&
							callPath.node.callee.object.type === "Identifier" &&
							callPath.node.callee.object.name === "NextResponse" &&
							callPath.node.callee.property.type === "Identifier" &&
							callPath.node.callee.property.name === "json"
						) {
							const args = callPath.node.arguments;
							const statusArg =
								args[1] && "properties" in args[1]
									? (args[1].properties as ObjectProperty[])?.find(
											(prop) =>
												prop.type === "ObjectProperty" &&
												prop.key.type === "Identifier" &&
												(prop.key as Identifier).name === "status",
										)
									: undefined;

							const status =
								statusArg &&
								"value" in statusArg &&
								statusArg.value.type === "NumericLiteral"
									? statusArg.value.value
									: 200;

							routeInfo.responses.push({
								status,
								description: "Response description",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												status: {
													type: "string",
													example: "success",
												},
												data: {
													type: "array",
													items: {
														type: "object",
													},
												},
											},
										},
									},
								},
							});
						}
					},
				});
			}
		},
	});

	return routeInfo;
}

function generatePaths(routes: RouteInfo[]) {
	const paths: Record<string, unknown> = {};

	for (const route of routes) {
		paths[route.path] = {
			[route.method]: {
				parameters: route.params?.map((param) => ({
					name: param.name,
					in: "query",
					required: param.required,
					schema: {
						type: param.type,
					},
					description: param.description,
				})),
				responses: route.responses.reduce<Record<string, unknown>>(
					(acc, response) => {
						acc[response.status] = {
							description: response.description,
							content: response.content,
						};
						return acc;
					},
					{},
				),
			},
		};
	}

	return paths;
}
