import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const apiKey = process.env.FREEIMAGE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'FREEIMAGE_API_KEY is not configured' },
            { status: 500 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get('source') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert file to base64 as required by some Chevereto implementations if multi-part is tricky
        // But Chevereto API v1 supports multi-part source
        const externalFormData = new FormData();
        externalFormData.append('key', apiKey);
        externalFormData.append('action', 'upload');
        externalFormData.append('source', file);

        const response = await fetch('https://freeimage.host/api/1/upload', {
            method: 'POST',
            body: externalFormData,
        });

        const data = await response.json();

        if (data.status_code === 200) {
            return NextResponse.json({
                url: data.image.url,
                display_url: data.image.display_url,
                thumb_url: data.image.thumb.url,
            });
        } else {
            return NextResponse.json(
                { error: data.error?.message || 'Upload failed' },
                { status: data.status_code || 500 }
            );
        }
    } catch (error: any) {
        console.error('Error uploading to freeimage.host:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
