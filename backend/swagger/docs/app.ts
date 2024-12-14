import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import fs from 'fs';
import path from 'path';

export const lambdaHandler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
    if (event.rawPath.includes('/api-docs')) {
        try {
        const yamlContent = fs.readFileSync('./docs.yaml', 'utf-8');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/x-yaml',
            },
            body: yamlContent,
        };
        } catch (error) {
            console.error('Error reading docs.yaml:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Failed to load API documentation.',
                }),
            };
        }
    }

    if (event.rawPath.startsWith('/swagger')) {
        const swaggerPath = getAbsoluteFSPath();
        const indexFilePath = path.join(swaggerPath, 'index.html');

        if (event.rawPath === '/swagger') {
            // Serve the customized index.html to set the Swagger URL to /api-docs
            let indexHtml = fs.readFileSync(indexFilePath, 'utf-8');
            indexHtml = indexHtml.replace(
                'https://petstore.swagger.io/v2/swagger.json',
                `${event.headers['x-forwarded-proto']}://${event.headers['host']}/api-docs`
            );

            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/html' },
                body: indexHtml,
            };
        }

        // Serve static files for Swagger UI (e.g., CSS, JS)
        const staticFilePath = path.join(swaggerPath, event.rawPath.replace('/swagger', ''));
        
        if (fs.existsSync(staticFilePath)) {
            const fileContent = fs.readFileSync(staticFilePath);
            const contentType = getContentType(staticFilePath);
            return {
                statusCode: 200,
                headers: { 'Content-Type': contentType },
                body: fileContent.toString('base64'),
                isBase64Encoded: true,
            };
        }

        return { statusCode: 404, body: 'Not Found' };
    }

    return {
        statusCode: 404,
        body: JSON.stringify({ 
            message: 'Not Found' 
        }),
    };
};

// Helper to determine content type for static files
const getContentType = (filePath: string): string => {
    if (filePath.endsWith('.html')) return 'text/html';
    if (filePath.endsWith('.js')) return 'application/javascript';
    if (filePath.endsWith('.css')) return 'text/css';
    if (filePath.endsWith('.png')) return 'image/png';
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return 'application/x-yaml';
    return 'application/octet-stream';
};
